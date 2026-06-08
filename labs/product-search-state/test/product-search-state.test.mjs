import test from "node:test";
import assert from "node:assert/strict";
import {
  applySearchParamPatch,
  buildProductQueryKey,
  countAppliedFilters,
  createFavoritePatch,
  deriveProductListViewState,
  parseProductSearchParams,
  serializeProductSearchParams,
  toProductCardModel,
} from "../dist/index.js";

test("parseProductSearchParams normalizes invalid and empty URL state", () => {
  assert.deepEqual(
    parseProductSearchParams(
      "?q=%20react%20&category=&minPrice=0&maxPrice=5000&sort=unknown&page=-1",
    ),
    {
      q: "react",
      maxPrice: 5000,
      sort: "latest",
      page: 1,
    },
  );
});

test("serializeProductSearchParams omits defaults and empty values", () => {
  assert.equal(
    serializeProductSearchParams({
      q: "react",
      category: undefined,
      minPrice: undefined,
      maxPrice: 5000,
      sort: "latest",
      page: 1,
    }),
    "?q=react&maxPrice=5000",
  );
});

test("applySearchParamPatch resets page when a filter changes", () => {
  const current = parseProductSearchParams(
    "?q=react&category=book&sort=popular&page=4",
  );

  assert.deepEqual(applySearchParamPatch(current, { category: "course" }), {
    q: "react",
    category: "course",
    sort: "popular",
    page: 1,
  });

  assert.deepEqual(applySearchParamPatch(current, { page: 5 }), {
    q: "react",
    category: "book",
    sort: "popular",
    page: 5,
  });
});

test("buildProductQueryKey includes every server-state input", () => {
  assert.deepEqual(
    buildProductQueryKey(
      parseProductSearchParams(
        "?q=react&category=book&minPrice=1000&maxPrice=5000&sort=popular&page=2",
      ),
      "user-1",
    ),
    [
      "products",
      {
        userId: "user-1",
        q: "react",
        category: "book",
        minPrice: 1000,
        maxPrice: 5000,
        sort: "popular",
        page: 2,
      },
    ],
  );
});

test("toProductCardModel keeps API shape out of the UI model", () => {
  assert.deepEqual(
    toProductCardModel({
      product_id: "p1",
      display_name: "Frontend Architecture",
      category: "book",
      price_cents: 2499,
      image_url: null,
    }),
    {
      id: "p1",
      name: "Frontend Architecture",
      category: "book",
      priceText: "$24.99",
      imageUrl: "/images/product-placeholder.png",
      isFavorite: false,
    },
  );
});

test("deriveProductListViewState computes derived state instead of storing it", () => {
  const params = parseProductSearchParams("?q=react&category=book&page=2");
  const item = toProductCardModel({
    product_id: "p1",
    display_name: "React Patterns",
    category: "book",
    price_cents: 1999,
    image_url: "/react.png",
    favorite: true,
  });

  assert.deepEqual(
    deriveProductListViewState({
      params,
      result: {
        items: [item],
        totalCount: 30,
        page: 2,
        pageSize: 10,
      },
    }),
    {
      status: "ready",
      items: [item],
      totalCount: 30,
      hasNextPage: true,
      appliedFilterCount: 2,
    },
  );

  assert.equal(countAppliedFilters(params), 2);
});

test("deriveProductListViewState separates empty and error states", () => {
  const params = parseProductSearchParams("");

  assert.deepEqual(deriveProductListViewState({ params }), {
    status: "empty",
    items: [],
  });

  assert.deepEqual(
    deriveProductListViewState({
      params,
      error: new Error("API failed"),
    }),
    {
      status: "error",
      items: [],
      message: "API failed",
    },
  );
});

test("createFavoritePatch supports optimistic update rollback", () => {
  const products = [
    {
      id: "p1",
      name: "React Patterns",
      category: "book",
      priceText: "$19.99",
      imageUrl: "/react.png",
      isFavorite: false,
    },
    {
      id: "p2",
      name: "Browser Internals",
      category: "book",
      priceText: "$29.99",
      imageUrl: "/browser.png",
      isFavorite: false,
    },
  ];

  const patch = createFavoritePatch(products, "p1", true);

  assert.equal(patch.nextProducts[0].isFavorite, true);
  assert.equal(patch.nextProducts[1].isFavorite, false);
  assert.deepEqual(patch.rollback(), products);
  assert.notEqual(patch.rollback(), products);
});
