export const defaultSearchParams = {
    sort: "latest",
    page: 1,
};
const allowedSorts = new Set([
    "latest",
    "popular",
    "price_asc",
    "price_desc",
]);
export function parseProductSearchParams(input) {
    const source = typeof input === "string"
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
        sort: sortCandidate && allowedSorts.has(sortCandidate)
            ? sortCandidate
            : defaultSearchParams.sort,
        page,
    });
}
export function serializeProductSearchParams(params) {
    const normalized = parseProductSearchParams(new URLSearchParams(Object.entries(params).flatMap(([key, value]) => value === undefined ? [] : [[key, String(value)]])));
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
export function applySearchParamPatch(current, patch) {
    const filterChanged = ["q", "category", "minPrice", "maxPrice", "sort"].some((key) => Object.prototype.hasOwnProperty.call(patch, key) &&
        patch[key] !== current[key]);
    return parseProductSearchParams(new URLSearchParams(Object.entries({
        ...current,
        ...patch,
        page: filterChanged ? 1 : patch.page ?? current.page,
    }).flatMap(([key, value]) => value === undefined ? [] : [[key, String(value)]])));
}
export function buildProductQueryKey(params, userId) {
    const normalized = parseProductSearchParams(serializeProductSearchParams(params));
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
    ];
}
export function toProductCardModel(input) {
    return {
        id: input.product_id,
        name: input.display_name,
        category: input.category,
        priceText: formatPrice(input.price_cents),
        imageUrl: input.image_url ?? "/images/product-placeholder.png",
        isFavorite: input.favorite ?? false,
    };
}
export function deriveProductListViewState(input) {
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
export function createFavoritePatch(products, productId, nextFavorite) {
    const previousProducts = products.map((product) => ({ ...product }));
    return {
        nextProducts: products.map((product) => product.id === productId
            ? { ...product, isFavorite: nextFavorite }
            : product),
        rollback() {
            return previousProducts;
        },
    };
}
export function countAppliedFilters(params) {
    let count = 0;
    if (params.q)
        count += 1;
    if (params.category)
        count += 1;
    if (params.minPrice !== undefined)
        count += 1;
    if (params.maxPrice !== undefined)
        count += 1;
    if (params.sort !== defaultSearchParams.sort)
        count += 1;
    return count;
}
function cleanString(value) {
    const normalized = value?.trim();
    return normalized ? normalized : undefined;
}
function parsePositiveInteger(value) {
    if (!value)
        return undefined;
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 1)
        return undefined;
    return parsed;
}
function pruneEmptyParams(params) {
    return {
        ...(params.q ? { q: params.q } : {}),
        ...(params.category ? { category: params.category } : {}),
        ...(params.minPrice !== undefined ? { minPrice: params.minPrice } : {}),
        ...(params.maxPrice !== undefined ? { maxPrice: params.maxPrice } : {}),
        sort: params.sort,
        page: params.page,
    };
}
function appendIfPresent(output, key, value) {
    if (value !== undefined) {
        output.set(key, String(value));
    }
}
function formatPrice(priceCents) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(priceCents / 100);
}
