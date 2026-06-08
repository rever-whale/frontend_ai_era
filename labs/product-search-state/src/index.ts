export type ProductSort = "latest" | "popular" | "price_asc" | "price_desc";

export interface ProductSearchParams {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort: ProductSort;
  page: number;
}

export interface ProductApiResponse {
  product_id: string;
  display_name: string;
  category: string;
  price_cents: number;
  image_url?: string | null;
  favorite?: boolean;
}

export interface ProductCardModel {
  id: string;
  name: string;
  category: string;
  priceText: string;
  imageUrl: string;
  isFavorite: boolean;
}

export interface ProductSearchResult {
  items: ProductCardModel[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export type ProductListViewState =
  | {
      status: "loading";
      items: ProductCardModel[];
    }
  | {
      status: "error";
      items: ProductCardModel[];
      message: string;
    }
  | {
      status: "empty";
      items: [];
    }
  | {
      status: "ready";
      items: ProductCardModel[];
      totalCount: number;
      hasNextPage: boolean;
      appliedFilterCount: number;
    };

export interface FavoritePatch {
  nextProducts: ProductCardModel[];
  rollback(): ProductCardModel[];
}

export const defaultSearchParams: ProductSearchParams = {
  sort: "latest",
  page: 1,
};

const allowedSorts = new Set<ProductSort>([
  "latest",
  "popular",
  "price_asc",
  "price_desc",
]);

export function parseProductSearchParams(
  input: string | URLSearchParams,
): ProductSearchParams {
  const source =
    typeof input === "string"
      ? new URLSearchParams(input.startsWith("?") ? input.slice(1) : input)
      : input;

  const q = cleanString(source.get("q"));
  const category = cleanString(source.get("category"));
  const minPrice = parsePositiveInteger(source.get("minPrice"));
  const maxPrice = parsePositiveInteger(source.get("maxPrice"));
  const sortCandidate = source.get("sort");
  const page = parsePositiveInteger(source.get("page")) ?? 1;

  return pruneEmptyParams({
    q,
    category,
    minPrice,
    maxPrice,
    sort:
      sortCandidate && allowedSorts.has(sortCandidate as ProductSort)
        ? (sortCandidate as ProductSort)
        : defaultSearchParams.sort,
    page,
  });
}

export function serializeProductSearchParams(
  params: ProductSearchParams,
): string {
  const normalized = parseProductSearchParams(
    new URLSearchParams(
      Object.entries(params).flatMap(([key, value]) =>
        value === undefined ? [] : [[key, String(value)]],
      ),
    ),
  );

  const output = new URLSearchParams();
  appendIfPresent(output, "q", normalized.q);
  appendIfPresent(output, "category", normalized.category);
  appendIfPresent(output, "minPrice", normalized.minPrice);
  appendIfPresent(output, "maxPrice", normalized.maxPrice);

  if (normalized.sort !== defaultSearchParams.sort) {
    output.set("sort", normalized.sort);
  }

  if (normalized.page !== defaultSearchParams.page) {
    output.set("page", String(normalized.page));
  }

  const query = output.toString();
  return query ? `?${query}` : "";
}

export function applySearchParamPatch(
  current: ProductSearchParams,
  patch: Partial<Omit<ProductSearchParams, "page">> & { page?: number },
): ProductSearchParams {
  const filterChanged = ["q", "category", "minPrice", "maxPrice", "sort"].some(
    (key) =>
      Object.prototype.hasOwnProperty.call(patch, key) &&
      patch[key as keyof typeof patch] !== current[key as keyof ProductSearchParams],
  );

  return parseProductSearchParams(
    new URLSearchParams(
      Object.entries({
        ...current,
        ...patch,
        page: filterChanged ? 1 : patch.page ?? current.page,
      }).flatMap(([key, value]) =>
        value === undefined ? [] : [[key, String(value)]],
      ),
    ),
  );
}

export function buildProductQueryKey(
  params: ProductSearchParams,
  userId: string,
): readonly [
  "products",
  {
    userId: string;
    q: string | null;
    category: string | null;
    minPrice: number | null;
    maxPrice: number | null;
    sort: ProductSort;
    page: number;
  },
] {
  const normalized = parseProductSearchParams(
    serializeProductSearchParams(params),
  );

  return [
    "products",
    {
      userId,
      q: normalized.q ?? null,
      category: normalized.category ?? null,
      minPrice: normalized.minPrice ?? null,
      maxPrice: normalized.maxPrice ?? null,
      sort: normalized.sort,
      page: normalized.page,
    },
  ] as const;
}

export function toProductCardModel(
  input: ProductApiResponse,
): ProductCardModel {
  return {
    id: input.product_id,
    name: input.display_name,
    category: input.category,
    priceText: formatPrice(input.price_cents),
    imageUrl: input.image_url ?? "/images/product-placeholder.png",
    isFavorite: input.favorite ?? false,
  };
}

export function deriveProductListViewState(input: {
  result?: ProductSearchResult;
  params: ProductSearchParams;
  isLoading?: boolean;
  error?: Error;
}): ProductListViewState {
  const items = input.result?.items ?? [];

  if (input.isLoading) {
    return { status: "loading", items };
  }

  if (input.error) {
    return { status: "error", items, message: input.error.message };
  }

  if (!input.result || input.result.items.length === 0) {
    return { status: "empty", items: [] };
  }

  return {
    status: "ready",
    items: input.result.items,
    totalCount: input.result.totalCount,
    hasNextPage: input.result.page * input.result.pageSize < input.result.totalCount,
    appliedFilterCount: countAppliedFilters(input.params),
  };
}

export function createFavoritePatch(
  products: ProductCardModel[],
  productId: string,
  nextFavorite: boolean,
): FavoritePatch {
  const previousProducts = products.map((product) => ({ ...product }));

  return {
    nextProducts: products.map((product) =>
      product.id === productId
        ? { ...product, isFavorite: nextFavorite }
        : product,
    ),
    rollback() {
      return previousProducts;
    },
  };
}

export function countAppliedFilters(params: ProductSearchParams): number {
  let count = 0;

  if (params.q) count += 1;
  if (params.category) count += 1;
  if (params.minPrice !== undefined) count += 1;
  if (params.maxPrice !== undefined) count += 1;
  if (params.sort !== defaultSearchParams.sort) count += 1;

  return count;
}

function cleanString(value: string | null): string | undefined {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

function parsePositiveInteger(value: string | null): number | undefined {
  if (!value) return undefined;

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) return undefined;

  return parsed;
}

function pruneEmptyParams(params: ProductSearchParams): ProductSearchParams {
  return {
    ...(params.q ? { q: params.q } : {}),
    ...(params.category ? { category: params.category } : {}),
    ...(params.minPrice !== undefined ? { minPrice: params.minPrice } : {}),
    ...(params.maxPrice !== undefined ? { maxPrice: params.maxPrice } : {}),
    sort: params.sort,
    page: params.page,
  };
}

function appendIfPresent(
  output: URLSearchParams,
  key: string,
  value: string | number | undefined,
): void {
  if (value !== undefined) {
    output.set(key, String(value));
  }
}

function formatPrice(priceCents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(priceCents / 100);
}
