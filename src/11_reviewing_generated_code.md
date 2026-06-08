# 11. 자동생성 코드를 리뷰하는 방법

AI가 만든 코드는 초안이다. 초안은 유용하지만 완성본은 아니다. 자동생성 코드를 리뷰할 때는 "문법이 맞는가"보다 "이 변경이 시스템에 들어와도 되는가"를 물어야 한다. 사용자는 코드가 누가 썼는지 모른다. 장애가 나면 AI가 아니라 팀이 고친다.

자동생성 코드 리뷰는 AI를 불신하는 절차가 아니다. 오히려 AI를 실무에 안전하게 들여오기 위한 협업 절차다. 빠른 초안을 받아들이되, 사람이 의미와 구조와 위험을 점검한다. 이 루프가 있어야 AI는 생산성 도구가 되고, 없으면 기술 부채 생성기가 된다.

## 리뷰의 첫 질문: 요구사항을 만족하는가

가장 먼저 볼 것은 요구사항이다. AI가 만든 코드는 그럴듯한 UI와 함수 이름을 만들 수 있지만, 실제 요구사항의 미묘한 조건을 놓칠 수 있다.

예를 들어 "검색 필터를 추가한다"는 요구사항에는 다음 조건이 숨어 있을 수 있다.

- 검색 조건이 URL에 남아야 한다.
- 뒤로 가기로 이전 조건이 복원되어야 한다.
- 필터 변경 시 페이지는 1로 돌아가야 한다.
- 빈 결과와 서버 오류는 다르게 보여야 한다.
- 권한이 없는 사용자는 일부 필터를 볼 수 없어야 한다.

AI가 단순히 입력창과 select를 추가했다면 기능은 있어 보이지만 요구사항은 부족하다. 리뷰어는 "화면이 생겼는가"가 아니라 "사용자 흐름이 맞는가"를 봐야 한다.

## 기존 패턴과 맞는가

자동생성 코드는 종종 기존 코드베이스의 관습을 우회한다. 기존에는 `apiClient`를 사용하고 있는데 직접 `fetch`를 호출한다. 기존에는 `Button` 컴포넌트를 쓰는데 새 버튼 스타일을 만든다. 기존에는 TanStack Query를 쓰는데 `useEffect`와 `useState`로 서버 상태를 직접 관리한다.

이런 코드는 작동할 수 있다. 하지만 팀의 유지보수성을 해친다. 코드베이스의 패턴은 단순한 취향이 아니라 축적된 운영 방식이다. AI가 만든 코드가 더 짧거나 새로워 보여도 기존 질서를 깨뜨린다면 비용이 생긴다.

리뷰할 때는 다음을 확인한다.

- 기존 공용 컴포넌트를 재사용했는가?
- API 호출 방식이 기존과 같은가?
- 에러 처리와 toast 방식이 일관적인가?
- 파일 위치와 이름이 프로젝트 관습을 따르는가?
- 테스트 스타일이 기존 테스트와 맞는가?

좋은 리뷰는 "이 코드 별로야"가 아니라 "이 프로젝트에서는 서버 상태를 query 훅으로 다루므로, 이 useEffect fetch는 기존 패턴과 맞지 않는다"처럼 말한다.

## 새 의존성은 정말 필요한가

AI는 문제를 풀기 위해 새 라이브러리를 제안할 수 있다. date formatting, form validation, animation, chart, drag and drop, utility 함수에 새 의존성을 추가하려고 할 수 있다. 하지만 의존성은 공짜가 아니다.

새 의존성을 검토할 때는 다음을 본다.

- 이미 프로젝트에 비슷한 도구가 있는가?
- 번들 크기에 영향이 큰가?
- 보안과 유지보수 상태는 괜찮은가?
- tree shaking이 되는가?
- 팀이 학습해야 하는 API가 늘어나는가?
- 작은 유틸리티로 충분한 문제인가?

AI가 "이 라이브러리를 설치하면 됩니다"라고 말해도 바로 받아들이지 않는다. 특히 프론트엔드에서는 번들 크기와 장기 유지보수가 중요하다.

## 상태와 데이터 흐름을 망치지 않았는가

자동생성 코드에서 가장 자주 보는 문제는 상태 중복이다. 서버에서 온 데이터를 지역 state에 복사하고, URL에 있어야 할 값을 컴포넌트 state에 두고, 파생 값을 별도 state로 저장한다.

리뷰어는 다음을 확인한다.

- 서버 상태를 클라이언트 state로 복사하지 않았는가?
- URL 상태와 form 상태가 불필요하게 중복되지 않는가?
- 파생 상태를 저장해 동기화 문제가 생기지 않는가?
- query key가 모든 입력 상태를 포함하는가?
- mutation 후 캐시 업데이트가 있는가?

AI가 만든 코드가 "작동하는 데모"에서 "운영 가능한 기능"으로 올라가려면 상태 흐름이 정리되어야 한다.

## 실패 모드를 다루는가

AI 생성 코드는 성공 경로에 강하고 실패 경로에 약한 경우가 많다. 프론트엔드에서는 실패 경로가 사용자 경험의 큰 부분이다.

검토할 실패 모드는 다음과 같다.

- 로딩 중 사용자가 다시 클릭하는 경우
- API 요청 실패
- 인증 만료
- 권한 없음
- 빈 데이터
- 느린 네트워크
- 오래된 응답
- 컴포넌트 unmount 후 응답
- optimistic update 실패
- validation error

실패 모드를 다루는 코드는 보통 더 길다. AI가 만든 코드가 너무 짧고 매끈하다면 실패 경로가 빠져 있을 가능성이 있다.

## 접근성과 키보드 조작

AI가 만든 UI는 시각적으로 그럴듯할 수 있지만 접근성을 놓치기 쉽다. 버튼처럼 보이는 `div`, label 없는 input, focus trap 없는 modal, 키보드로 열 수 없는 dropdown, 스크린 리더 이름이 없는 icon button은 흔한 문제다.

리뷰할 때는 다음을 본다.

- 클릭 가능한 요소가 실제 button이나 anchor인가?
- input에 label이 연결되어 있는가?
- icon button에 accessible name이 있는가?
- modal과 dropdown의 focus 흐름이 맞는가?
- 키보드만으로 주요 동작을 수행할 수 있는가?
- ARIA를 과하게 쓰지 않았는가?

접근성은 마지막에 장식처럼 붙이는 것이 아니다. 컴포넌트 구조를 결정하는 기준이다.

## 보안과 개인정보

자동생성 코드는 보안 맥락을 모른 채 편리한 코드를 제안할 수 있다. 토큰을 localStorage에 저장하거나, 사용자 입력을 raw HTML로 렌더링하거나, 에러 객체 전체를 화면에 보여주거나, 클라이언트 번들에 secret을 넣는 식이다.

리뷰어는 최소한 다음을 확인해야 한다.

- 민감한 값이 브라우저 저장소나 번들에 들어가지 않는가?
- 사용자 입력과 외부 HTML이 안전하게 처리되는가?
- 인증/권한 실패가 적절히 처리되는가?
- 로그와 에러 메시지가 개인정보를 노출하지 않는가?
- CORS나 CSRF 문제를 위험한 방식으로 우회하지 않는가?

프론트엔드 보안은 백엔드만의 일이 아니다. 브라우저에 들어가는 코드는 사용자가 볼 수 있고 조작할 수 있다.

## 테스트는 무엇을 보장하는가

AI에게 테스트를 만들게 하면 성공 케이스 중심의 테스트가 나올 수 있다. 리뷰어는 테스트가 있다는 사실보다 무엇을 보장하는지 봐야 한다.

좋은 테스트는 다음을 포함한다.

- 사용자 행동 중심의 상호작용
- 실패 상태
- 빈 상태
- 권한 또는 인증 상태
- 비동기 race condition이 중요한 경우의 방어
- 접근성 query
- 회귀 가능성이 높은 비즈니스 규칙

테스트가 구현 세부 사항에 너무 강하게 묶여 있으면 리팩터링 때 쉽게 깨진다. 반대로 너무 표면적인 테스트는 중요한 버그를 놓친다. AI가 만든 테스트도 리뷰 대상이다.

## 사례: 검색 필터 초안 리뷰

다음은 AI가 상품 검색 필터를 빠르게 구현했다고 가정한 초안이다. 화면은 동작할 수 있지만, 실제 제품 코드로 병합하기에는 여러 문제가 숨어 있다.

```tsx
function ProductSearchPage() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/products?q=${q}&category=${category}&page=${page}`)
      .then((res) => res.json())
      .then((data) => {
        setItems(data.items);
        setError("");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [q, category, page]);

  return (
    <section>
      <input value={q} onChange={(event) => setQ(event.target.value)} />
      <select value={category} onChange={(event) => setCategory(event.target.value)}>
        <option value="">All</option>
        <option value="book">Book</option>
      </select>
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      <ProductGrid products={items} />
      <button onClick={() => setPage(page + 1)}>Next</button>
    </section>
  );
}
```

이 코드는 짧고 직관적이다. 그러나 리뷰어는 다음 문제를 잡아야 한다.

- 검색 조건이 URL에 남지 않는다.
- 새로고침과 뒤로 가기에서 검색 조건이 복원되지 않는다.
- 필터가 바뀌어도 `page`가 1로 초기화되지 않는다.
- 서버 상태를 직접 지역 state에 복사한다.
- 오래된 응답이 최신 응답을 덮어쓸 수 있다.
- 빈 결과와 API 실패가 구분되지 않는다.
- input에 label이 없다.
- API client, query hook, error handling 같은 기존 패턴을 우회한다.

좋은 리뷰 코멘트는 이렇게 쓸 수 있다.

```text
이 초안은 화면 구성은 빠르게 만들었지만, 검색 조건이 URL 상태로 관리되어야 한다는 요구사항을 만족하지 못합니다.
기존 `useProductSearchParams`와 `useProductListQuery` 패턴을 사용해 주세요.
검색어/카테고리/정렬/페이지는 URL query parameter를 단일 출처로 삼고,
필터 변경 시 page는 1로 초기화되어야 합니다.
빈 결과와 API 실패 상태를 분리하고, input에는 label을 연결해 주세요.
```

이 피드백은 "별로다"가 아니라 구조적이다. AI에게 다시 돌려보낼 수 있고, 사람 리뷰어도 어떤 기준으로 반려했는지 이해할 수 있다.

## 사례: 개선된 구조

같은 기능을 제품 코드에 더 가깝게 만들면 구조가 달라진다.

```tsx
function ProductSearchPage() {
  const [params, setParams] = useProductSearchParams();
  const productList = useProductListQuery(params);

  const updateFilter = (patch: ProductFilterPatch) => {
    setParams(applySearchParamPatch(params, patch));
  };

  return (
    <ProductSearchView
      params={params}
      items={productList.items}
      status={productList.status}
      errorMessage={productList.errorMessage}
      onFilterChange={updateFilter}
      onPageChange={(page) => setParams({ ...params, page })}
    />
  );
}
```

이 코드는 반드시 더 짧지는 않다. 하지만 책임이 나뉘어 있다.

- `useProductSearchParams`는 URL 상태를 담당한다.
- `applySearchParamPatch`는 필터 변경 시 page reset 규칙을 고정한다.
- `useProductListQuery`는 서버 상태와 캐시를 담당한다.
- `ProductSearchView`는 UI 표현과 사용자 이벤트를 담당한다.

리뷰의 목표는 코드를 길게 만드는 것이 아니다. 변경 이유가 읽히는 구조로 만드는 것이다. AI 초안은 종종 빠른 구현에는 충분하지만, 운영 가능한 코드가 되려면 이런 경계가 필요하다.

## 사례: 리뷰 체크를 테스트로 바꾸기

리뷰에서 잡은 규칙은 가능하면 테스트로 바꾼다. 예를 들어 "필터 변경 시 page는 1로 초기화되어야 한다"는 말은 다음처럼 고정할 수 있다.

```ts
test("filter change resets page", () => {
  const current = parseProductSearchParams("?q=react&category=book&page=4");

  expect(applySearchParamPatch(current, { category: "course" })).toEqual({
    q: "react",
    category: "course",
    sort: "latest",
    page: 1,
  });
});
```

이 테스트는 단순한 구현 확인이 아니다. 리뷰어가 중요하다고 판단한 제품 규칙을 코드베이스에 남기는 일이다. AI가 다음에 같은 기능을 수정하더라도 이 규칙은 쉽게 사라지지 않는다.

## 리뷰 결과를 다시 AI에게 돌려보내기

자동생성 코드 리뷰의 장점은 리뷰 결과를 다시 AI에게 줄 수 있다는 것이다. 사람 리뷰어가 모든 수정을 직접 할 필요는 없다. 중요한 것은 피드백이 구체적이어야 한다.

나쁜 피드백:

```text
더 깔끔하게 고쳐줘.
```

좋은 피드백:

```text
이 변경에서 서버 상태를 지역 state로 복사한 부분을 제거해줘.
기존 `useProductListQuery` 패턴을 사용하고,
빈 결과와 API 실패 상태를 분리하며,
필터 변경 시 page query parameter가 1로 초기화되게 해줘.
```

AI는 구체적인 구조 피드백에 더 잘 반응한다. 리뷰어의 역할은 막연한 불만을 구조적 요청으로 바꾸는 것이다.

## 병합 전 최종 질문

자동생성 코드를 병합하기 전에 마지막으로 다음을 묻는다.

- 이 코드를 내가 설명할 수 있는가?
- 이 변경이 왜 필요한지 리뷰어가 이해할 수 있는가?
- 실패했을 때 어디를 봐야 하는지 알 수 있는가?
- 기존 코드베이스의 질서를 지키는가?
- 검증하지 못한 위험을 알고 있는가?

"이해하지 못한 코드는 병합하지 않는다"는 원칙은 AI 시대에 더 중요하다. 코드를 적게 썼더라도 책임은 줄어들지 않는다.

## 출처

- GitHub Copilot docs, code review: https://docs.github.com/en/copilot
- OWASP Cheat Sheet Series: https://cheatsheetseries.owasp.org/
- Stack Overflow Developer Survey 2025: https://survey.stackoverflow.co/2025/
- Testing Library docs: https://testing-library.com/docs/
- Local lab: `frontend-ai-era/labs/product-search-state`
