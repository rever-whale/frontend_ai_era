# 9. 타입, 계약, 경계

TypeScript는 AI 시대의 프론트엔드에서 더 중요해졌다. 타입은 사람이 읽는 문서이면서 AI가 코드를 생성할 때 참고하는 구조적 힌트다. 명확한 타입은 잘못된 제안을 줄이고, 리팩터링을 안전하게 만들며, 코드베이스의 의도를 보존한다.

하지만 타입을 많이 쓴다고 자동으로 좋은 코드가 되는 것은 아니다. `any`로 가득한 코드도 TypeScript 파일일 수 있고, 모든 필드를 optional로 둔 타입은 거의 계약이 아니다. 타입은 값의 모양을 설명하는 데서 출발하지만, 좋은 타입은 도메인의 의미와 경계를 표현한다.

## 타입은 계약이다

계약은 양쪽의 기대를 명확히 한다. API 응답 타입은 서버와 클라이언트 사이의 계약이다. 컴포넌트 props는 부모와 자식 사이의 계약이다. 이벤트 payload는 사용자 행동을 처리하는 코드 사이의 계약이다. route params와 query params도 계약이다.

계약이 명확하면 AI가 코드를 생성할 때도 더 좋은 결과를 낸다. 예를 들어 `Product` 타입이 명확하고, `ProductSearchParams` 타입이 있고, `ProductSearchResult` 타입이 있으면 AI는 그 구조 안에서 코드를 만들 수 있다. 반대로 데이터가 `object`나 `any`로 흘러다니면 AI는 추측한다.

개발자가 해야 할 일은 AI에게 추측할 여지를 줄이는 것이다. 타입은 그 여지를 줄이는 가장 좋은 방법 중 하나다.

## API 타입과 UI 타입은 다를 수 있다

외부 API 응답 타입을 UI 타입으로 그대로 쓰면 편하다. 하지만 항상 좋은 선택은 아니다. 서버의 데이터 구조는 서버의 이유로 만들어진다. UI는 사용자의 행동과 화면 표현을 중심으로 값을 필요로 한다.

예를 들어 서버 응답은 다음과 같을 수 있다.

```ts
type ProductResponse = {
  id: string;
  name: string;
  price_cents: number;
  image_url: string | null;
  flags?: string[];
};
```

하지만 상품 카드 UI에는 다음 모델이 더 적합할 수 있다.

```ts
type ProductCardViewModel = {
  id: string;
  title: string;
  priceText: string;
  imageUrl: string;
  isSoldOut: boolean;
};
```

이 둘을 구분하면 UI 컴포넌트가 서버의 세부 표현에 묶이지 않는다. API가 `price_cents`를 `price` 객체로 바꾸더라도 adapter만 수정하면 된다. AI가 서버 응답 타입을 컴포넌트 props로 그대로 퍼뜨리고 있다면 경계가 사라지고 있는 것이다.

## optional의 의미

TypeScript에서 `?`는 편리하지만 남용하기 쉽다. optional은 "없을 수 있다"는 뜻이다. 하지만 왜 없을 수 있는지는 여러 가지다.

- 서버가 필드를 보내지 않을 수 있다.
- 아직 로딩 중이라 값이 없다.
- 권한이 없어 볼 수 없다.
- 사용자가 입력하지 않았다.
- feature flag가 꺼져 있다.

이 모든 상황을 `name?: string` 하나로 표현하면 의미가 사라진다. 예를 들어 사용자 프로필이 아직 로딩 중인 상황과, 서버에 프로필 이미지가 없는 상황은 다르다.

더 나은 타입은 상태를 분리한다.

```ts
type ProfileState =
  | { status: "loading" }
  | { status: "ready"; profile: Profile }
  | { status: "error"; message: string };
```

이렇게 하면 값이 없는 이유를 코드가 설명한다. AI가 optional을 많이 추가했다면, 그 optional이 실제 도메인 의미인지 아니면 로딩/에러 상태를 흐리고 있는지 확인해야 한다.

## discriminated union

discriminated union은 상태를 명확히 표현하는 강력한 도구다. 특히 비동기 상태, 폼 상태, 권한 상태, 결제 상태처럼 서로 배타적인 경우에 유용하다.

```ts
type SaveState =
  | { status: "idle" }
  | { status: "saving" }
  | { status: "saved"; savedAt: string }
  | { status: "failed"; error: Error };
```

이 타입은 `status`에 따라 사용할 수 있는 필드가 달라진다. `status`가 `failed`일 때만 `error`가 있고, `saved`일 때만 `savedAt`이 있다. boolean 여러 개보다 안전하고 읽기 쉽다.

AI가 `isLoading`, `isSaved`, `isError`, `error`, `savedAt` 같은 상태를 모두 따로 만들었다면 union type으로 바꿀 수 있는지 검토한다. 타입은 모순을 표현할 수 없게 만들 때 가장 강력하다.

## exhaustive check

union type을 사용할 때는 모든 경우를 처리했는지 확인하는 것이 중요하다. TypeScript에서는 `never`를 이용해 exhaustive check를 만들 수 있다.

```ts
function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${value}`);
}

function getSaveMessage(state: SaveState): string {
  switch (state.status) {
    case "idle":
      return "변경 사항이 없습니다.";
    case "saving":
      return "저장 중입니다.";
    case "saved":
      return `${state.savedAt}에 저장되었습니다.`;
    case "failed":
      return state.error.message;
    default:
      return assertNever(state);
  }
}
```

새 상태가 추가되면 TypeScript가 처리 누락을 알려줄 수 있다. AI가 union에 새 variant를 추가했는데 UI 처리를 빠뜨리는 문제를 줄일 수 있다.

## 런타임 검증

TypeScript 타입은 빌드 타임에만 존재한다. 브라우저에서 실제 API 응답이 타입과 다르게 와도 TypeScript가 자동으로 막아주지는 않는다. 외부 입력, API 응답, localStorage 데이터, URL query parameter는 런타임 검증이 필요할 수 있다.

Zod 같은 schema validation 도구는 이런 경계에서 유용하다.

```ts
import { z } from "zod";

const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  priceCents: z.number().int().nonnegative(),
});

type Product = z.infer<typeof ProductSchema>;
```

모든 데이터에 schema를 붙일 필요는 없다. 하지만 외부에서 들어오는 데이터, 저장소에서 복원하는 데이터, 보안이나 결제와 연결된 데이터는 런타임 검증을 고려해야 한다.

AI가 "타입을 정의했으니 안전하다"고 말하더라도, 그 타입이 실제 런타임 값을 검증하는 것은 아니다. 이 경계를 혼동하면 위험하다.

## generated types와 API 계약

OpenAPI, GraphQL, tRPC 같은 도구는 서버 계약에서 타입을 생성할 수 있다. generated types는 중복을 줄이고 서버와 클라이언트의 계약을 맞추는 데 도움이 된다. AI 시대에는 특히 유용하다. 명확한 generated type이 있으면 AI가 API 구조를 추측할 필요가 줄어든다.

하지만 generated type이 UI 설계를 대신하지는 않는다. 서버 타입은 서버 계약이고, UI 타입은 화면 계약이다. 둘 사이에는 adapter나 mapper가 필요할 수 있다. generated type을 그대로 모든 컴포넌트 props에 퍼뜨리면 API 변경이 UI 전체로 번진다.

좋은 구조는 다음과 같다.

- API layer: generated type을 사용한다.
- adapter layer: API 응답을 도메인/UI 모델로 바꾼다.
- UI layer: 안정적인 view model을 받는다.

이 경계는 AI가 코드를 수정할 때도 안전장치가 된다.

## 컴포넌트 props 계약

컴포넌트 props도 계약이다. props가 너무 많으면 컴포넌트의 책임이 넓다는 신호일 수 있다. boolean props가 많이 늘어나면 가능한 조합이 폭발한다.

```ts
type ButtonProps = {
  isPrimary?: boolean;
  isDanger?: boolean;
  isGhost?: boolean;
};
```

이 타입은 `isPrimary`와 `isDanger`가 동시에 true일 수 있다. 더 나은 방식은 variant를 하나의 값으로 표현하는 것이다.

```ts
type ButtonVariant = "primary" | "danger" | "ghost";

type ButtonProps = {
  variant: ButtonVariant;
};
```

가능한 상태를 타입으로 제한하면 AI가 잘못된 조합을 만들 가능성도 줄어든다. 프론트엔드 타입 설계의 목표는 "가능한 값"이 아니라 "허용되는 의미"를 표현하는 것이다.

## 이벤트 payload와 도메인 언어

이벤트 payload도 타입으로 명확히 표현해야 한다. 특히 analytics, form submit, command action, domain event는 `Record<string, unknown>`처럼 두면 금방 흐려진다.

```ts
type ProductClickedEvent = {
  type: "product_clicked";
  productId: string;
  source: "search_result" | "recommendation" | "favorite_list";
};
```

이런 타입은 도메인 언어를 보존한다. AI에게 analytics 코드를 만들게 할 때도 이벤트 이름과 payload 타입이 명확하면 임의의 필드를 만들 가능성이 줄어든다.

## AI 생성 코드 리뷰 질문

타입과 계약 관점에서 AI가 만든 코드를 리뷰할 때는 다음 질문을 던진다.

- `any`, `unknown`, 지나치게 넓은 object 타입이 불필요하게 쓰이지 않았는가?
- optional 필드가 값이 없는 이유를 흐리고 있지 않은가?
- API 응답 타입과 UI view model이 무분별하게 섞이지 않았는가?
- boolean 여러 개로 모순 가능한 상태를 만들지 않았는가?
- union type과 exhaustive check로 상태를 더 명확히 만들 수 있는가?
- 외부 입력과 API 응답에 런타임 검증이 필요한가?
- generated type이 UI 전체로 직접 퍼지고 있지 않은가?
- 컴포넌트 props가 가능한 조합을 타입으로 제한하는가?
- 이벤트 payload가 도메인 언어를 보존하는가?

타입은 AI 시대의 방어선이다. 좋은 타입은 AI가 더 나은 코드를 만들게 하고, 사람이 더 빠르게 리뷰하게 하며, 잘못된 변경을 더 일찍 드러낸다. 타입은 코드의 모양이 아니라 시스템의 약속을 표현해야 한다.

## 출처

- TypeScript Handbook: https://www.typescriptlang.org/docs/
- TypeScript Handbook, Narrowing: https://www.typescriptlang.org/docs/handbook/2/narrowing.html
- Zod docs: https://zod.dev/
- GitHub Octoverse 2025: https://github.blog/news-insights/octoverse/octoverse-a-new-developer-joins-github-every-second-as-ai-leads-typescript-to-1/
