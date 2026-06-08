# 8. 복잡도를 낮추는 디자인 패턴

디자인 패턴은 이름을 외우기 위한 것이 아니라 복잡도를 다루기 위한 언어다. 프론트엔드에서 패턴은 컴포넌트 합성, 컨테이너와 프레젠테이션 분리, 커스텀 훅, compound components, adapter, facade, state machine, command, strategy 같은 형태로 나타난다.

AI 시대에는 패턴을 더 조심해서 써야 한다. AI는 "그럴듯한 추상화"를 빠르게 만들 수 있다. 하지만 그 추상화가 실제 문제를 줄이지 않으면 코드만 더 복잡해진다. 좋은 패턴은 변경을 견디게 하지만, 나쁜 패턴은 단순한 코드를 설명하기 어려운 코드로 바꾼다.

## 패턴은 문제 뒤에 온다

패턴을 먼저 정하고 코드를 맞추면 과설계가 된다. 반대로 문제를 충분히 관찰한 뒤 패턴을 도입하면 복잡도를 줄일 수 있다.

예를 들어 버튼 하나를 만들기 위해 compound component 패턴을 도입할 필요는 없다. 하지만 탭, 메뉴, select, accordion처럼 여러 하위 요소가 공유 상태와 접근성 관계를 가져야 하는 컴포넌트라면 compound component가 유용할 수 있다.

마찬가지로 단순한 API 호출에는 adapter가 필요 없을 수 있다. 하지만 서버 응답 구조가 UI에 그대로 맞지 않거나, 여러 API 버전을 다뤄야 하거나, 외부 서비스 데이터를 내부 도메인 모델로 바꿔야 한다면 adapter가 필요하다.

좋은 질문은 "이 패턴을 쓰면 멋져 보이는가"가 아니라 "이 패턴이 변경 비용을 줄이는가"다.

## 컴포넌트 합성

프론트엔드의 가장 기본적인 패턴은 컴포넌트 합성이다. 큰 화면을 작은 컴포넌트로 나누고, 각 컴포넌트가 명확한 책임을 갖게 하는 것이다. 그러나 컴포넌트를 많이 나눈다고 항상 좋은 것은 아니다. 너무 작은 컴포넌트가 흩어져 있으면 흐름을 읽기 어려워진다.

컴포넌트를 나눌 때는 다음 기준을 사용한다.

- UI의 의미 단위가 분명한가?
- 독립적으로 테스트하거나 story를 만들 가치가 있는가?
- 상태나 이벤트 책임이 분리되는가?
- 반복해서 사용되는가?
- 이름을 붙였을 때 도메인 의미가 생기는가?

AI가 만든 코드는 종종 한 파일에 모든 것을 몰아넣는다. 반대로 "컴포넌트를 나눠줘"라고 요청하면 의미 없는 작은 컴포넌트를 많이 만들기도 한다. 사람은 분리의 기준을 줘야 한다. "폼 필드, 결과 목록, 빈 상태, 페이지네이션을 의미 단위로 나누되, 단순 wrapper는 만들지 마"처럼 말하는 편이 좋다.

## 컨테이너와 프레젠테이션 분리

컨테이너와 프레젠테이션 분리는 오래된 패턴이지만 여전히 유용하다. 핵심은 데이터를 가져오고 상태를 관리하는 부분과, props를 받아 화면을 그리는 부분을 나누는 것이다.

예를 들어 상품 목록 화면에서 컨테이너는 URL 상태를 읽고, query를 호출하고, mutation을 연결한다. 프레젠테이션 컴포넌트는 `items`, `isLoading`, `error`, `onFavoriteToggle`, `onPageChange` 같은 props를 받아 화면을 그린다.

이 분리의 장점은 테스트와 이해 가능성이다. 프레젠테이션 컴포넌트는 서버 상태 도구나 라우터 없이도 테스트할 수 있다. 컨테이너는 데이터 흐름에 집중한다.

하지만 모든 컴포넌트를 억지로 container/presentational로 나눌 필요는 없다. 작은 컴포넌트에서는 오히려 파일만 늘어난다. 이 패턴은 데이터 흐름과 UI 표현이 섞여서 읽기 어려워질 때 도입한다.

## 커스텀 훅과 composable

React의 커스텀 훅, Vue의 composable은 로직 재사용과 책임 분리에 유용하다. 그러나 훅은 단순히 코드를 함수로 빼는 도구가 아니다. 훅은 상태와 side effect를 가진 작은 모듈이다.

좋은 훅은 이름만 봐도 역할을 알 수 있다.

- `useProductSearchParams`: URL 검색 조건을 읽고 쓴다.
- `useProductListQuery`: 상품 목록 서버 상태를 관리한다.
- `useFavoriteMutation`: 즐겨찾기 변경과 캐시 업데이트를 처리한다.

나쁜 훅은 너무 많은 일을 한다.

```ts
useProductPageEverything()
```

이런 훅은 URL, API, toast, analytics, modal 상태를 모두 품을 가능성이 있다. 처음에는 컨테이너를 깨끗하게 만드는 것처럼 보이지만, 복잡도를 다른 파일로 숨긴 것뿐이다.

AI에게 훅을 만들게 할 때는 훅의 책임을 한 문장으로 제한한다. "URL query parameter 파싱과 업데이트만 담당하는 훅을 만들어줘"처럼 요청하면 좋다.

## Adapter: 외부 세계와 내부 모델 사이

외부 API 응답은 내부 UI 모델과 다를 수 있다. 서버는 snake_case를 쓰고, 가격을 문자열로 내려주고, optional 필드를 포함하고, UI에는 필요 없는 메타데이터를 함께 보낼 수 있다. 이 값을 컴포넌트 곳곳에서 직접 해석하면 외부 계약이 UI 전체로 퍼진다.

Adapter 패턴은 외부 데이터를 내부 모델로 바꾸는 경계를 만든다.

```ts
type ProductApiResponse = {
  product_id: string;
  display_name: string;
  price_cents: number;
  image_url?: string;
};

type ProductCardModel = {
  id: string;
  name: string;
  priceText: string;
  imageUrl: string;
};

function toProductCardModel(input: ProductApiResponse): ProductCardModel {
  return {
    id: input.product_id,
    name: input.display_name,
    priceText: formatPrice(input.price_cents),
    imageUrl: input.image_url ?? "/images/product-placeholder.png",
  };
}
```

이렇게 하면 UI 컴포넌트는 API의 세부 구조를 몰라도 된다. API가 바뀌면 adapter를 중심으로 수정한다. AI가 만든 코드가 API 응답을 컴포넌트에서 직접 해체하고 있다면 adapter를 고려해야 한다.

## Facade: 복잡한 도구를 단순한 인터페이스로

Facade는 복잡한 내부 구현을 단순한 인터페이스 뒤에 숨기는 패턴이다. 예를 들어 analytics SDK, feature flag SDK, 결제 SDK, 지도 SDK는 직접 컴포넌트에서 호출하기보다 내부 wrapper를 두는 편이 좋다.

```ts
trackProductClicked({ productId, source: "search_result" });
```

컴포넌트는 analytics SDK의 구체적인 API를 몰라도 된다. 나중에 SDK가 바뀌거나 이벤트 필드가 바뀌어도 wrapper를 수정하면 된다.

AI가 기능을 만들 때 외부 SDK 호출을 컴포넌트 곳곳에 직접 넣는 경우가 있다. 이런 코드는 빠르게 만들어지지만 교체가 어렵다. 외부 세계와 만나는 지점에는 facade나 adapter가 필요할 수 있다.

## State machine: 흐름이 복잡할 때

상태가 많아지고 전이가 복잡해지면 boolean 몇 개로는 부족하다. 예를 들어 결제 흐름은 `idle`, `validating`, `submitting`, `requires_auth`, `success`, `failed`, `cancelled` 같은 상태를 가질 수 있다. 이 상태들은 서로 배타적이며, 어떤 상태에서 어떤 이벤트가 가능한지도 중요하다.

이럴 때 state machine이 도움이 된다. 반드시 XState 같은 라이브러리를 써야 한다는 뜻은 아니다. discriminated union과 reducer만으로도 상태 전이를 명시할 수 있다.

```ts
type CheckoutState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "requires_auth"; redirectUrl: string }
  | { status: "success"; orderId: string }
  | { status: "failed"; message: string };
```

이 타입은 `isLoading`, `isError`, `isSuccess`, `needsAuth` 같은 boolean이 동시에 모순된 값을 갖는 것을 막는다. AI가 복잡한 폼이나 결제 흐름을 boolean 여러 개로 만들었다면 상태 기계를 고려해야 한다.

## Command와 Strategy

Command 패턴은 사용자의 동작을 명령 객체나 함수로 표현할 때 유용하다. 예를 들어 에디터에서 undo/redo가 필요하거나, 여러 액션을 큐에 넣고 실행해야 하거나, 같은 동작을 나중에 재시도해야 할 때 도움이 된다.

Strategy 패턴은 알고리즘이나 정책이 바뀌는 지점을 분리한다. 예를 들어 정렬 방식, 가격 계산 방식, 권한 체크 방식, 검색 ranking 방식이 상황에 따라 달라진다면 strategy로 나눌 수 있다.

프론트엔드에서 이런 패턴은 거창하게 보일 수 있다. 그러나 복잡한 SaaS, 대시보드, 에디터, 커머스에서는 자주 등장한다. 중요한 것은 패턴 이름이 아니라 변경 지점이다. "여기가 바뀔 수 있는 정책인가"를 물으면 strategy가 보이고, "이 동작을 기록하거나 되돌려야 하는가"를 물으면 command가 보인다.

## 패턴을 도입하지 말아야 할 때

패턴은 복잡도를 줄이기 위해 존재한다. 따라서 다음 상황에서는 도입을 미룬다.

- 요구사항이 아직 불안정하고 무엇이 반복될지 모른다.
- 컴포넌트가 작고 읽기 쉽다.
- 추상화 이름이 도메인 의미를 갖지 못한다.
- 분리 후 파일을 오가야만 이해할 수 있다.
- 테스트나 변경 비용이 실제로 줄지 않는다.

AI는 "더 깔끔하게 리팩터링해줘"라는 요청에 과도한 추상화를 만들 수 있다. 좋은 리팩터링 요청은 "이 컴포넌트에서 API 응답 변환만 adapter로 분리해줘"처럼 문제와 경계를 지정한다.

## AI 생성 코드 리뷰 질문

디자인 패턴 관점에서 AI가 만든 코드를 리뷰할 때는 다음 질문을 던진다.

- 컴포넌트 분리가 의미 단위로 되어 있는가?
- 한 컴포넌트가 UI, 데이터 요청, 상태, analytics, 변환 로직을 모두 맡고 있지 않은가?
- 커스텀 훅의 책임이 한 문장으로 설명되는가?
- 외부 API 응답이 UI 컴포넌트 곳곳에 직접 퍼져 있지 않은가?
- 외부 SDK 호출이 facade 없이 흩어져 있지 않은가?
- boolean 조합으로 모순 가능한 상태를 만들지 않았는가?
- 패턴이 실제 변경 비용을 줄이는가, 아니면 이름만 늘렸는가?
- 새 추상화가 테스트를 더 쉽게 만드는가?

패턴은 개발자의 어휘다. 어휘가 많으면 문제를 더 정확히 설명할 수 있다. 하지만 좋은 문장은 어려운 단어를 많이 쓰는 문장이 아니라, 필요한 단어를 정확히 쓰는 문장이다. 코드도 같다.

## 출처

- React docs, Reusing Logic with Custom Hooks: https://react.dev/learn/reusing-logic-with-custom-hooks
- React docs, Composition vs Inheritance: https://legacy.reactjs.org/docs/composition-vs-inheritance.html
- XState docs: https://stately.ai/docs
- Refactoring Guru, Design Patterns: https://refactoring.guru/design-patterns
