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
export type ProductListViewState = {
    status: "loading";
    items: ProductCardModel[];
} | {
    status: "error";
    items: ProductCardModel[];
    message: string;
} | {
    status: "empty";
    items: [];
} | {
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
export declare const defaultSearchParams: ProductSearchParams;
export declare function parseProductSearchParams(input: string | URLSearchParams): ProductSearchParams;
export declare function serializeProductSearchParams(params: ProductSearchParams): string;
export declare function applySearchParamPatch(current: ProductSearchParams, patch: Partial<Omit<ProductSearchParams, "page">> & {
    page?: number;
}): ProductSearchParams;
export declare function buildProductQueryKey(params: ProductSearchParams, userId: string): readonly [
    "products",
    {
        userId: string;
        q: string | null;
        category: string | null;
        minPrice: number | null;
        maxPrice: number | null;
        sort: ProductSort;
        page: number;
    }
];
export declare function toProductCardModel(input: ProductApiResponse): ProductCardModel;
export declare function deriveProductListViewState(input: {
    result?: ProductSearchResult;
    params: ProductSearchParams;
    isLoading?: boolean;
    error?: Error;
}): ProductListViewState;
export declare function createFavoritePatch(products: ProductCardModel[], productId: string, nextFavorite: boolean): FavoritePatch;
export declare function countAppliedFilters(params: ProductSearchParams): number;
