# 16. 사례 연구: 기능 하나를 끝까지 만들기

이 장은 책의 앞부분에서 다룬 내용을 하나의 기능 개발 흐름에 적용한다. 예제 기능은 "상품 목록에서 검색, 필터, 정렬, 페이지네이션, 즐겨찾기, 빈 상태, 에러 상태를 제공하는 화면"이다. 이 기능은 특별히 화려하지 않지만 대부분의 프론트엔드 애플리케이션에서 반복되는 문제를 포함한다.

이 사례 연구의 목적은 완벽한 예제 앱을 만드는 것이 아니다. AI와 함께 기능을 만들 때 사람이 어떤 순간에 판단해야 하는지 보여주는 것이다. AI가 초안을 만들 수는 있지만, 상태의 경계, API 계약, 접근성, 테스트, 성능, 에러 처리는 사람이 의식적으로 검토해야 한다.

## 기능 요구사항

사용자는 상품 목록 화면에서 다음 행동을 할 수 있어야 한다.

- 검색어를 입력해 상품명을 검색한다.
- 카테고리와 가격 범위로 필터링한다.
- 최신순, 인기순, 가격순으로 정렬한다.
- 페이지를 이동한다.
- 상품을 즐겨찾기에 추가하거나 제거한다.
- 검색 조건을 URL로 공유할 수 있다.
- 새로고침하거나 뒤로 가기를 해도 검색 조건이 유지된다.
- 결과가 없을 때 빈 상태를 본다.
- API 요청이 실패하면 에러 상태와 재시도 버튼을 본다.

이 요구사항은 평범해 보이지만 설계할 것이 많다. 검색어는 입력 즉시 API를 호출해야 하는가, 제출 버튼을 눌렀을 때만 호출해야 하는가. 필터 상태는 컴포넌트 안에 둘 것인가, URL에 둘 것인가. 즐겨찾기 상태는 서버 상태인가 클라이언트 상태인가. 페이지 이동 중 이전 결과를 유지할 것인가, 로딩 스피너로 비울 것인가. 이 질문들이 프론트엔드 설계의 실제 난이도다.

## 상태 분류

먼저 상태를 분류한다.

URL 상태:

- 검색어
- 카테고리
- 가격 범위
- 정렬 기준
- 페이지 번호

서버 상태:

- 상품 목록
- 총 개수
- 현재 페이지의 응답 상태
- 즐겨찾기 반영 결과

지역 UI 상태:

- 필터 패널 열림 여부
- 검색 입력 중 임시 값
- 즐겨찾기 버튼의 optimistic pending 상태

파생 상태:

- 적용된 필터 개수
- 빈 상태 표시 여부
- 다음 페이지 가능 여부

이 분류를 먼저 해두면 AI에게도 더 좋은 요청을 할 수 있다. "필터 UI를 만들어줘"보다 "검색 조건은 URL 상태로 관리하고, 서버 데이터는 query cache로 관리하며, 필터 패널 열림 여부만 지역 상태로 둬"라고 말하는 편이 훨씬 낫다.

## API 계약

예제 API 계약은 다음과 같이 둘 수 있다.

```ts
type ProductSort = "latest" | "popular" | "price_asc" | "price_desc";

type ProductSearchParams = {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort: ProductSort;
  page: number;
};

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  imageUrl: string;
  isFavorite: boolean;
};

type ProductSearchResult = {
  items: Product[];
  totalCount: number;
  page: number;
  pageSize: number;
};
```

이 타입은 단순한 코드가 아니라 계약이다. AI가 컴포넌트를 만들 때 이 계약을 기준으로 삼게 해야 한다. 특히 API 응답과 UI 모델이 항상 같은 것은 아니라는 점을 기억해야 한다. 서버가 내려주는 값이 화면에 바로 쓰기 불편하다면 adapter를 두고 변환한다.

## AI에게 줄 작업 헌장

이 기능을 AI와 함께 만든다면 첫 요청은 다음과 같이 작성할 수 있다.

```text
목표:
상품 목록 화면에 검색, 필터, 정렬, 페이지네이션을 추가한다.

상태 규칙:
검색어, 카테고리, 가격 범위, 정렬, 페이지는 URL query parameter로 관리한다.
서버 응답은 TanStack Query로 관리한다.
필터 패널 열림 여부만 지역 상태로 둔다.

기존 패턴:
기존 `src/features/products` 폴더의 컴포넌트 구조를 따른다.
공용 버튼, 입력, select 컴포넌트를 새로 만들지 말고 재사용한다.

완료 조건:
새로고침 후 검색 조건이 유지된다.
뒤로 가기로 이전 검색 조건이 복원된다.
빈 결과와 API 실패 상태가 표시된다.
주요 흐름 테스트가 추가된다.

제약:
새 상태 관리 라이브러리를 추가하지 않는다.
API 계약은 변경하지 않는다.
```

이 요청은 AI에게 단순히 코드를 만들라고 하지 않는다. 설계의 중요한 결정을 사람이 먼저 잡아준다. AI는 그 안에서 구현을 돕는다.

## 예상되는 AI의 실수

이 기능에서 AI가 자주 만들 수 있는 실수는 다음과 같다.

- 검색 조건을 URL과 컴포넌트 state에 동시에 저장한다.
- 페이지 번호를 필터 변경 후 1로 초기화하지 않는다.
- 빈 문자열을 query parameter에 남긴다.
- API 실패와 빈 결과를 같은 화면으로 처리한다.
- 오래된 요청 응답이 최신 결과를 덮어쓰게 둔다.
- 즐겨찾기 optimistic update 실패를 되돌리지 않는다.
- 버튼에 접근 가능한 이름을 제공하지 않는다.
- 이미지 크기를 지정하지 않아 레이아웃 이동을 만든다.
- 테스트가 성공 케이스만 확인한다.

이 목록은 AI를 불신하기 위한 것이 아니다. 리뷰 기준을 만들기 위한 것이다. 사람이 예상 실패 모드를 알고 있으면 AI에게 더 구체적인 보완을 요청할 수 있다.

## 구현 순서

실제 구현은 다음 순서로 나누는 것이 좋다.

1. URL query parameter 파싱과 직렬화 함수를 만든다.
2. `ProductSearchParams` 타입과 기본값을 정의한다.
3. 상품 검색 query 함수를 만든다.
4. 목록 화면에서 URL 상태를 읽어 query를 호출한다.
5. 필터 패널과 정렬 컨트롤을 연결한다.
6. 빈 상태, 로딩 상태, 에러 상태를 추가한다.
7. 페이지네이션을 추가한다.
8. 즐겨찾기 mutation과 optimistic update를 추가한다.
9. 테스트를 추가한다.
10. 브라우저에서 새로고침, 뒤로 가기, 느린 네트워크를 확인한다.

AI에게도 이 순서대로 요청하는 편이 좋다. 한 번에 전체를 만들게 하면 상태와 UI가 섞이기 쉽다. 작은 단계로 나누면 각 단계의 diff를 사람이 이해할 수 있다.

## 검증 체크리스트

기능이 완성되었다고 보기 전에 다음을 확인한다.

- 검색 조건이 URL에 반영되는가?
- 새로고침 후 같은 결과가 보이는가?
- 뒤로 가기로 이전 조건이 복원되는가?
- 필터 변경 시 페이지가 1로 돌아가는가?
- 빈 결과와 API 실패가 구분되는가?
- 로딩 중 중복 클릭이나 중복 요청이 문제가 되지 않는가?
- 키보드로 필터와 정렬을 조작할 수 있는가?
- 즐겨찾기 실패 시 UI가 되돌아오는가?
- 이미지 영역에 안정적인 크기가 있는가?
- 테스트가 실패 모드를 포함하는가?

이 체크리스트는 기능 하나를 위한 것이지만, 다른 기능에도 그대로 응용할 수 있다. AI 시대의 개발자는 코드를 빨리 만드는 것보다 검증 가능한 기능 단위를 만드는 데 익숙해야 한다.

## 사례 연구의 핵심 교훈

이 사례에서 가장 중요한 교훈은 상태의 위치를 먼저 정해야 한다는 것이다. 상태의 위치가 정리되면 컴포넌트 구조, API 호출, 테스트, 접근성 검증이 훨씬 단순해진다. 반대로 상태가 뒤섞이면 AI가 만든 코드는 점점 더 복잡해지고, 사람도 어디서부터 고쳐야 할지 알기 어려워진다.

AI는 구현 속도를 높여준다. 하지만 설계의 순서를 대신 정해주지는 않는다. 좋은 프론트엔드 개발자는 AI에게 코드를 쓰게 하기 전에, 코드가 들어갈 구조를 만든다.

## 실습 lab

이 장의 사례 연구는 `frontend-ai-era/labs/product-search-state`에 실행 가능한 TypeScript lab으로 연결되어 있다. 이 lab은 완성된 UI 앱이 아니라 상태 설계와 검증 계약을 작게 고정하는 실습이다.

lab에서 다루는 항목은 다음과 같다.

- URL query parameter 파싱과 직렬화
- 필터 변경 시 `page`를 1로 초기화하는 규칙
- 서버 상태 query key에 모든 입력 상태를 포함하는 규칙
- API 응답과 UI view model을 분리하는 adapter
- 빈 상태와 에러 상태를 구분하는 view state
- 파생 상태를 저장하지 않고 계산하는 방식
- 즐겨찾기 optimistic update와 rollback

실행 방법은 다음과 같다.

```bash
cd frontend-ai-era/labs/product-search-state
../../../prompt-harness/labs/contract-harness/node_modules/.bin/tsc -p tsconfig.json
node --test test/*.test.mjs
```

## 출처

- React docs, Thinking in React: https://react.dev/learn/thinking-in-react
- TanStack Query docs: https://tanstack.com/query/latest
- Playwright docs: https://playwright.dev/docs/intro
- Testing Library docs: https://testing-library.com/docs/
- TypeScript Handbook: https://www.typescriptlang.org/docs/
- Local lab: `frontend-ai-era/labs/product-search-state`
