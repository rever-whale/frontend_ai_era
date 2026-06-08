const PAGE_SIZE = 6;
const DEFAULT_PARAMS = {
  q: "",
  category: "",
  sort: "latest",
  page: 1,
};

const products = [
  product("p1", "React Patterns for Product Teams", "book", 2499, 93, "linear-gradient(135deg, #b8d9ff, #f6f1d7)"),
  product("p2", "Browser Rendering Field Guide", "book", 2999, 88, "linear-gradient(135deg, #d2f5df, #d7e7ff)"),
  product("p3", "TypeScript Contract Workshop", "course", 15900, 96, "linear-gradient(135deg, #ffe0e0, #e4ddff)"),
  product("p4", "Accessibility Review Kit", "tool", 4900, 76, "linear-gradient(135deg, #fff1b8, #ccebdc)"),
  product("p5", "AI Code Review Playbook", "book", 1999, 91, "linear-gradient(135deg, #dde7ff, #f8d7e8)"),
  product("p6", "Frontend Estimation Cards", "tool", 3900, 69, "linear-gradient(135deg, #f2eee3, #c8e7f4)"),
  product("p7", "State Machine UI Course", "course", 12900, 84, "linear-gradient(135deg, #dff3ff, #ffe1c2)"),
  product("p8", "Performance Budget Template", "tool", 2900, 72, "linear-gradient(135deg, #d7f7e5, #f7d7d7)"),
  product("p9", "Server State Query Patterns", "book", 2199, 79, "linear-gradient(135deg, #e8e2ff, #d8f1ef)"),
  product("p10", "Design System Refactoring Lab", "course", 17900, 87, "linear-gradient(135deg, #fce3d5, #dbeafe)"),
  product("p11", "Security Checklist for Frontend", "tool", 5900, 74, "linear-gradient(135deg, #f7e8cc, #d5eff7)"),
  product("p12", "URL State Search Examples", "book", 1499, 82, "linear-gradient(135deg, #d7f0e4, #f5d7ea)"),
];

const state = {
  params: readParamsFromUrl(),
  favorites: new Set(["p2", "p5"]),
  failNextRequest: false,
  currentResult: null,
  status: "idle",
};

const els = {
  form: document.querySelector("#search-form"),
  q: document.querySelector("#q"),
  category: document.querySelector("#category"),
  sort: document.querySelector("#sort"),
  failNext: document.querySelector("#fail-next"),
  filterCount: document.querySelector("#filter-count"),
  stateMap: document.querySelector("#state-map"),
  copyUrl: document.querySelector("#copy-url"),
  feedback: document.querySelector("#feedback"),
  grid: document.querySelector("#product-grid"),
  meta: document.querySelector("#result-meta"),
  prev: document.querySelector("#prev-page"),
  next: document.querySelector("#next-page"),
  pageLabel: document.querySelector("#page-label"),
  template: document.querySelector("#product-card-template"),
};

syncControls();
bindEvents();
render();
void runSearch();

function product(id, name, category, priceCents, popularity, imageStyle) {
  return { id, name, category, priceCents, popularity, imageStyle };
}

function bindEvents() {
  els.q.addEventListener("input", debounce(() => updateParams({ q: els.q.value }), 240));
  els.category.addEventListener("change", () => updateParams({ category: els.category.value }));
  els.sort.addEventListener("change", () => updateParams({ sort: els.sort.value }));
  els.failNext.addEventListener("change", () => {
    state.failNextRequest = els.failNext.checked;
  });
  els.prev.addEventListener("click", () => updateParams({ page: state.params.page - 1 }, false));
  els.next.addEventListener("click", () => updateParams({ page: state.params.page + 1 }, false));
  els.copyUrl.addEventListener("click", async () => {
    await navigator.clipboard?.writeText(window.location.href);
    showFeedback("현재 검색 URL을 복사했습니다.");
  });
  window.addEventListener("popstate", () => {
    state.params = readParamsFromUrl();
    syncControls();
    void runSearch();
  });
}

function readParamsFromUrl() {
  const search = new URLSearchParams(window.location.search);
  const page = Number(search.get("page"));
  return {
    q: clean(search.get("q")) ?? DEFAULT_PARAMS.q,
    category: clean(search.get("category")) ?? DEFAULT_PARAMS.category,
    sort: normalizeSort(search.get("sort")),
    page: Number.isInteger(page) && page > 0 ? page : DEFAULT_PARAMS.page,
  };
}

function updateParams(patch, resetPage = true) {
  const filterKeys = ["q", "category", "sort"];
  const filterChanged = resetPage && filterKeys.some((key) => key in patch && patch[key] !== state.params[key]);
  state.params = {
    ...state.params,
    ...patch,
    page: filterChanged ? 1 : patch.page ?? state.params.page,
  };
  writeParamsToUrl(state.params);
  syncControls();
  void runSearch();
}

function writeParamsToUrl(params) {
  const output = new URLSearchParams();
  if (params.q) output.set("q", params.q);
  if (params.category) output.set("category", params.category);
  if (params.sort !== DEFAULT_PARAMS.sort) output.set("sort", params.sort);
  if (params.page !== DEFAULT_PARAMS.page) output.set("page", String(params.page));
  const query = output.toString();
  history.pushState(null, "", query ? `?${query}` : window.location.pathname);
}

async function runSearch() {
  state.status = "loading";
  render();
  await delay(360);
  if (state.failNextRequest) {
    state.failNextRequest = false;
    els.failNext.checked = false;
    state.status = "error";
    render();
    return;
  }
  state.currentResult = searchProducts(state.params);
  state.status = state.currentResult.items.length ? "ready" : "empty";
  render();
}

function searchProducts(params) {
  const query = params.q.toLowerCase();
  const filtered = products
    .filter((item) => (query ? item.name.toLowerCase().includes(query) : true))
    .filter((item) => (params.category ? item.category === params.category : true))
    .sort(sortProducts(params.sort));
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(params.page, totalPages);
  if (safePage !== params.page) {
    state.params = { ...state.params, page: safePage };
    writeParamsToUrl(state.params);
  }
  const start = (safePage - 1) * PAGE_SIZE;
  return {
    items: filtered.slice(start, start + PAGE_SIZE),
    totalCount: filtered.length,
    page: safePage,
    totalPages,
  };
}

function render() {
  const result = state.currentResult ?? { items: [], totalCount: 0, page: state.params.page, totalPages: 1 };
  const appliedFilters = countAppliedFilters(state.params);
  els.filterCount.textContent = `${appliedFilters} filter${appliedFilters === 1 ? "" : "s"}`;
  els.meta.textContent = `${result.totalCount} items`;
  els.pageLabel.textContent = `${result.page} / ${result.totalPages}`;
  els.prev.disabled = state.status === "loading" || result.page <= 1;
  els.next.disabled = state.status === "loading" || result.page >= result.totalPages;
  els.stateMap.textContent = `URL state: ${serializeParams(state.params) || "(defaults)"} | server state: ${state.status}`;

  els.grid.innerHTML = "";
  els.feedback.hidden = true;
  els.feedback.className = "feedback";

  if (state.status === "loading") {
    showFeedback("검색 결과를 불러오는 중입니다.");
    return;
  }
  if (state.status === "error") {
    showFeedback("API 요청 실패 상태입니다. 검색 조건은 유지되고, 다음 요청에서 다시 시도할 수 있습니다.", "error");
    return;
  }
  if (state.status === "empty") {
    showFeedback("조건에 맞는 상품이 없습니다. 빈 상태와 API 실패 상태는 분리되어야 합니다.");
    return;
  }

  for (const item of result.items) {
    els.grid.appendChild(renderProductCard(item));
  }
}

function renderProductCard(item) {
  const node = els.template.content.cloneNode(true);
  const article = node.querySelector(".productCard");
  const link = node.querySelector(".productLink");
  const img = node.querySelector("img");
  const category = node.querySelector(".categoryPill");
  const title = node.querySelector("h3");
  const price = node.querySelector(".price");
  const favorite = node.querySelector(".favoriteButton");
  const isFavorite = state.favorites.has(item.id);

  article.style.setProperty("--image-bg", item.imageStyle);
  link.href = `#product-${item.id}`;
  img.style.background = item.imageStyle;
  category.textContent = item.category;
  title.textContent = item.name;
  price.textContent = formatPrice(item.priceCents);
  favorite.textContent = isFavorite ? "♥" : "♡";
  favorite.setAttribute("aria-pressed", String(isFavorite));
  favorite.setAttribute("aria-label", `${item.name} 즐겨찾기 ${isFavorite ? "해제" : "추가"}`);
  favorite.addEventListener("click", () => toggleFavorite(item.id));
  return node;
}

async function toggleFavorite(productId) {
  const wasFavorite = state.favorites.has(productId);
  if (wasFavorite) {
    state.favorites.delete(productId);
  } else {
    state.favorites.add(productId);
  }
  render();
  await delay(240);
  if (state.failNextRequest) {
    state.failNextRequest = false;
    els.failNext.checked = false;
    if (wasFavorite) {
      state.favorites.add(productId);
    } else {
      state.favorites.delete(productId);
    }
    render();
    showFeedback("즐겨찾기 변경 요청이 실패해 optimistic update를 rollback했습니다.", "error");
  }
}

function syncControls() {
  els.q.value = state.params.q;
  els.category.value = state.params.category;
  els.sort.value = state.params.sort;
}

function showFeedback(message, kind = "info") {
  els.feedback.textContent = message;
  els.feedback.hidden = false;
  els.feedback.className = kind === "error" ? "feedback error" : "feedback";
}

function countAppliedFilters(params) {
  return Number(Boolean(params.q)) + Number(Boolean(params.category)) + Number(params.sort !== DEFAULT_PARAMS.sort);
}

function serializeParams(params) {
  const output = new URLSearchParams();
  if (params.q) output.set("q", params.q);
  if (params.category) output.set("category", params.category);
  if (params.sort !== DEFAULT_PARAMS.sort) output.set("sort", params.sort);
  if (params.page !== DEFAULT_PARAMS.page) output.set("page", String(params.page));
  return output.toString();
}

function sortProducts(sort) {
  return (a, b) => {
    if (sort === "popular") return b.popularity - a.popularity;
    if (sort === "price_asc") return a.priceCents - b.priceCents;
    if (sort === "price_desc") return b.priceCents - a.priceCents;
    return b.id.localeCompare(a.id);
  };
}

function normalizeSort(value) {
  return ["latest", "popular", "price_asc", "price_desc"].includes(value) ? value : DEFAULT_PARAMS.sort;
}

function clean(value) {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

function formatPrice(priceCents) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(priceCents / 100);
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function debounce(callback, wait) {
  let timer = 0;
  return (...args) => {
    clearTimeout(timer);
    timer = window.setTimeout(() => callback(...args), wait);
  };
}
