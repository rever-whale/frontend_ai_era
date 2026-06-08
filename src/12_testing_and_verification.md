# 12. 테스트와 검증 루프

AI 시대의 테스트는 더 중요해진다. 코드 생성 속도가 빨라질수록 검증 루프가 느슨하면 결함도 빠르게 누적된다. 테스트는 AI를 불신해서 만드는 것이 아니라, AI와 사람이 더 빠르게 협업하기 위한 안전장치다.

검증 없는 AI 개발은 빠른 초안 만들기에 머문다. 반대로 검증 루프가 있는 팀은 AI가 만든 변경을 더 자신 있게 받아들일 수 있다. 중요한 것은 모든 것을 테스트하는 것이 아니라, 어떤 위험을 어떤 검증으로 잡을지 아는 것이다.

## 검증은 여러 층이다

프론트엔드 검증은 하나의 도구로 끝나지 않는다. 여러 층이 서로 다른 종류의 위험을 잡는다.

- 타입 검사: 값의 형태와 계약을 확인한다.
- 린트: 코드 스타일, 훅 규칙, 잠재적 실수를 잡는다.
- 단위 테스트: 순수 함수와 작은 로직을 확인한다.
- 컴포넌트 테스트: 렌더링과 사용자 이벤트를 확인한다.
- E2E 테스트: 실제 브라우저에서 주요 흐름을 확인한다.
- 시각적 회귀 테스트: 레이아웃과 스타일 변화를 확인한다.
- 접근성 검사: label, role, keyboard, contrast를 확인한다.
- 성능 측정: 로딩, 상호작용, 번들 비용을 확인한다.

각 층은 한계가 있다. 타입 검사는 런타임 API 응답이 진짜 맞는지 보장하지 않는다. 단위 테스트는 브라우저에서 focus가 제대로 움직이는지 충분히 보지 못할 수 있다. E2E 테스트는 강력하지만 느리고 관리 비용이 크다. 따라서 검증 전략은 균형의 문제다.

## 타입 검사와 린트

타입 검사와 린트는 가장 빠른 방어선이다. AI가 만든 코드에서 잘못된 props, 누락된 return, 잘못된 union 처리, hook dependency 문제를 빠르게 잡을 수 있다.

하지만 타입과 린트가 통과한다고 기능이 맞는 것은 아니다. 타입은 코드의 모양을 확인하고, 린트는 규칙 위반을 찾는다. 사용자 경험과 비즈니스 요구사항은 별도의 테스트와 검토가 필요하다.

AI에게 코드를 만들게 할 때는 "타입 에러 없이"만 요구하지 말고 "타입이 도메인 상태를 명확히 표현하게" 요구해야 한다. 린트 경고를 없애기 위해 dependency array를 비우거나 eslint disable을 추가하는 식의 변경은 특히 조심해야 한다.

## 단위 테스트

단위 테스트는 순수 함수, adapter, parser, formatter, reducer, validation rule처럼 입력과 출력이 명확한 코드에 적합하다. 프론트엔드에서는 UI보다 주변 로직에 단위 테스트가 큰 효과를 낼 때가 많다.

예를 들어 URL query parameter 파싱 함수는 단위 테스트하기 좋다.

```ts
expect(parseProductSearchParams("?q=react&page=2")).toEqual({
  q: "react",
  page: 2,
  sort: "latest",
});
```

이런 테스트는 AI가 코드를 수정해도 핵심 계약을 지켜준다. 특히 adapter와 schema validation은 단위 테스트의 좋은 대상이다. 외부 API와 내부 모델 사이의 경계가 깨지면 많은 UI가 영향을 받기 때문이다.

## 컴포넌트 테스트

컴포넌트 테스트는 사용자가 보는 것과 하는 일을 기준으로 작성해야 한다. 내부 state 이름이나 함수 호출보다, 화면에 무엇이 보이고 사용자가 어떤 행동을 할 수 있는지를 확인한다.

좋은 컴포넌트 테스트는 다음과 같은 질문에 답한다.

- 사용자가 필요한 정보를 볼 수 있는가?
- 버튼이나 입력을 조작하면 기대한 변화가 생기는가?
- 로딩, 에러, 빈 상태가 표시되는가?
- 접근 가능한 이름과 role로 요소를 찾을 수 있는가?

Testing Library의 철학은 구현 세부 사항보다 사용자 관점에 가깝게 테스트하는 것이다. AI에게 테스트를 작성하게 할 때도 "state가 바뀌는지 확인해줘"보다 "사용자가 검색어를 입력하고 검색 결과를 보는 흐름을 테스트해줘"라고 요청하는 편이 낫다.

## E2E 테스트

E2E 테스트는 실제 브라우저에서 사용자의 핵심 흐름을 검증한다. 로그인, 상품 검색, 결제, 설정 저장, 권한별 화면 접근 같은 흐름은 E2E 테스트의 좋은 후보이다.

E2E 테스트는 강력하지만 모든 것을 E2E로 검증하면 느려지고 불안정해진다. 따라서 핵심 사용자 여정과 회귀 비용이 큰 기능에 집중한다.

AI 시대의 E2E 테스트는 특히 중요하다. AI가 여러 파일을 빠르게 수정할 때 작은 단위 테스트가 통과해도 실제 브라우저 흐름이 깨질 수 있다. Playwright 같은 도구는 브라우저에서 실제 클릭, 입력, navigation, network mocking을 검증할 수 있다.

## 실패 케이스를 요청하기

AI에게 테스트를 작성하게 하면 성공 케이스만 나오는 경우가 많다. 사람은 실패 케이스를 명시해야 한다.

예를 들어 상품 검색 테스트를 요청한다면 다음을 포함한다.

- 검색 결과가 있을 때 목록을 보여준다.
- 결과가 없을 때 빈 상태를 보여준다.
- API가 실패하면 에러와 재시도 버튼을 보여준다.
- 필터를 바꾸면 page가 1로 초기화된다.
- 뒤로 가기로 이전 검색 조건이 복원된다.
- 빠른 입력에서도 오래된 응답이 최신 결과를 덮어쓰지 않는다.

테스트는 요구사항을 코드로 바꾸는 작업이다. AI에게 테스트를 맡기더라도 요구사항의 실패 모드는 사람이 제공해야 한다.

## 사례: 리뷰에서 테스트로 이동하기

자동생성 코드 리뷰에서 발견한 문제는 "조심하자"로 끝나면 반복된다. 가능한 경우 테스트로 옮겨야 한다. 11장의 검색 필터 초안에서 리뷰어가 잡은 규칙은 다음 테스트로 바꿀 수 있다.

```ts
test("serializeProductSearchParams omits defaults and empty values", () => {
  expect(
    serializeProductSearchParams({
      q: "react",
      category: undefined,
      minPrice: undefined,
      maxPrice: 5000,
      sort: "latest",
      page: 1,
    }),
  ).toBe("?q=react&maxPrice=5000");
});
```

이 테스트는 URL이 지저분해지는 문제를 막는다. 빈 값과 기본값이 URL에 남으면 뒤로 가기, 공유 링크, query key가 예상과 다르게 동작할 수 있다. 작은 테스트지만 제품 경험을 지킨다.

또 다른 테스트는 서버 상태 query key를 고정한다.

```ts
test("buildProductQueryKey includes every server-state input", () => {
  expect(
    buildProductQueryKey(
      parseProductSearchParams(
        "?q=react&category=book&minPrice=1000&maxPrice=5000&sort=popular&page=2",
      ),
      "user-1",
    ),
  ).toEqual([
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
  ]);
});
```

AI가 서버 상태 코드를 만들 때 query key에서 일부 조건을 빠뜨리면 캐시가 틀린 데이터를 보여줄 수 있다. 이 테스트는 단순히 함수 출력을 확인하는 것이 아니라, 서버 상태의 정확성을 보장한다.

마지막으로 optimistic update는 실패했을 때 되돌릴 수 있어야 한다.

```ts
test("createFavoritePatch supports optimistic update rollback", () => {
  const patch = createFavoritePatch(products, "p1", true);

  expect(patch.nextProducts[0].isFavorite).toBe(true);
  expect(patch.rollback()).toEqual(products);
});
```

이런 테스트들은 화려하지 않다. 하지만 AI가 만든 초안을 제품 코드로 받아들이기 전에 필요한 최소 계약을 남긴다. 리뷰가 말이라면 테스트는 기억이다.

## 시각적 회귀와 접근성

프론트엔드에서는 "기능은 되지만 화면이 깨진" 문제가 자주 생긴다. 시각적 회귀 테스트는 레이아웃, 간격, 색, 겹침, responsive breakpoint 문제를 잡는 데 도움을 준다. 모든 화면에 도입하기 어렵다면 핵심 컴포넌트와 자주 깨지는 화면부터 시작할 수 있다.

접근성 검증도 자동화할 수 있는 부분과 수동 확인이 필요한 부분이 있다. 자동 도구는 label 누락, role 문제, contrast 일부를 잡아준다. 하지만 실제 키보드 흐름, 스크린 리더 경험, focus management는 사람이 확인해야 한다.

AI가 만든 UI를 검증할 때는 최소한 다음을 본다.

- 키보드만으로 주요 흐름을 사용할 수 있는가?
- focus가 예측 가능하게 이동하는가?
- icon button에 accessible name이 있는가?
- modal이 열렸을 때 배경으로 focus가 새지 않는가?
- 색만으로 상태를 전달하지 않는가?

## 성능 검증

성능은 느낌만으로 판단하기 어렵다. 빠른 개발 환경에서는 괜찮아 보여도 실제 사용자의 기기와 네트워크에서는 느릴 수 있다. 성능 검증은 번들 크기, 렌더링 비용, network waterfall, Core Web Vitals, interaction delay를 함께 본다.

AI가 만든 코드에서 성능 위험이 큰 지점은 다음과 같다.

- 큰 라이브러리 추가
- 렌더링마다 비싼 계산 수행
- 이미지 크기와 lazy loading 누락
- 불필요한 클라이언트 컴포넌트 증가
- debounce/throttle 없는 빈번한 이벤트 처리
- key가 불안정한 목록 렌더링

성능 테스트는 항상 완벽할 수 없다. 하지만 변경이 성능에 영향을 줄 가능성이 있다면 최소한 위험을 언급하고 측정 방법을 제안해야 한다.

## 검증 결과를 기록하기

검증은 실행하는 것만큼 기록하는 것도 중요하다. 코드 리뷰나 PR 설명에는 다음이 남아야 한다.

```text
검증:
- 타입 검사 통과
- 컴포넌트 테스트 통과
- 상품 검색 E2E 통과
- 브라우저에서 필터/뒤로 가기/빈 상태 확인

미검증:
- 모바일 Safari 수동 확인은 하지 못함
- 실제 운영 API의 500 응답은 mock으로만 확인
```

미검증 항목을 기록하는 것은 약점이 아니라 정직함이다. 모든 것을 확인하지 못했다면 무엇을 확인하지 못했는지 알아야 한다.

## AI 생성 테스트 리뷰 질문

AI가 만든 테스트를 리뷰할 때는 다음 질문을 던진다.

- 테스트가 사용자의 행동과 결과를 중심으로 작성되었는가?
- 성공 케이스뿐 아니라 실패 케이스도 있는가?
- mock 데이터가 실제 계약과 맞는가?
- 구현 세부 사항에 과하게 묶여 있지 않은가?
- 비동기 흐름을 안정적으로 기다리는가?
- 접근성 query를 사용할 수 있는 곳에서 사용했는가?
- 테스트 이름이 요구사항을 설명하는가?
- 중요한 회귀 위험을 실제로 잡을 수 있는가?

좋은 검증 루프는 개발자를 느리게 만들지 않는다. 오히려 AI가 만든 변경을 더 빨리 받아들일 수 있게 한다.

## 출처

- Testing Library docs: https://testing-library.com/docs/
- Playwright docs: https://playwright.dev/docs/intro
- Vitest docs: https://vitest.dev/
- web.dev, Learn Testing: https://web.dev/learn/testing/
- web.dev, Learn Accessibility: https://web.dev/learn/accessibility/
- Local lab: `frontend-ai-era/labs/product-search-state`
