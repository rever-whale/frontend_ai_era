# 5. 자바스크립트 런타임과 이벤트 루프

프론트엔드 버그의 상당수는 비동기 흐름을 잘못 이해해서 생긴다. 사용자는 버튼을 클릭하고, 네트워크 요청은 지연되고, 상태는 여러 번 바뀌며, 렌더링은 그 사이에 일어난다. 이 과정을 이해하려면 자바스크립트 런타임과 이벤트 루프를 알아야 한다.

AI가 만든 코드는 문법적으로는 맞아도 시간의 흐름을 틀릴 수 있다. 요청 A가 먼저 시작했지만 요청 B보다 늦게 끝날 수 있다. 컴포넌트가 사라진 뒤에도 비동기 작업이 상태를 바꾸려 할 수 있다. 사용자가 버튼을 두 번 눌러 같은 요청이 중복 전송될 수 있다. 이런 문제는 타입만으로 잡히지 않는다.

## 콜 스택과 실행의 기본

자바스크립트는 한 번에 하나의 실행 흐름을 처리한다. 함수가 호출되면 콜 스택에 쌓이고, 함수 실행이 끝나면 스택에서 빠진다. 이 모델은 단순하지만 브라우저 환경에서는 사용자 입력, 네트워크, 타이머, 렌더링 같은 일이 함께 일어나기 때문에 비동기 모델이 필요하다.

다음 코드를 보자.

```js
console.log("A");

setTimeout(() => {
  console.log("B");
}, 0);

Promise.resolve().then(() => {
  console.log("C");
});

console.log("D");
```

출력 순서는 `A`, `D`, `C`, `B`다. `setTimeout`의 지연 시간이 0이어도 즉시 실행되는 것은 아니다. Promise의 `.then`은 마이크로태스크로 처리되고, 타이머 콜백은 태스크 큐에서 처리된다. 이 차이를 모르면 UI 업데이트와 비동기 콜백의 순서를 잘못 예상하게 된다.

## 태스크와 마이크로태스크

브라우저는 이벤트 루프를 통해 여러 작업을 조율한다. 사용자 클릭, 타이머, 네트워크 콜백 같은 작업은 태스크로 처리된다. Promise callback, queueMicrotask 같은 작업은 마이크로태스크로 처리된다. 보통 하나의 태스크가 끝나면 마이크로태스크 큐가 비워지고, 그다음 브라우저가 렌더링할 기회를 얻는다.

이 모델은 프론트엔드 코드에서 중요하다. 마이크로태스크를 너무 많이 이어붙이면 브라우저가 렌더링할 기회를 늦게 얻을 수 있다. 반대로 렌더링 이후에 해야 하는 작업을 너무 일찍 실행하면 DOM이 기대한 상태가 아닐 수 있다.

프레임워크는 이런 세부 사항을 일부 감춰준다. 하지만 감춰준다는 것은 사라졌다는 뜻이 아니다. React의 상태 업데이트, Vue의 nextTick, Svelte의 tick 같은 API도 결국 렌더링 타이밍을 다루기 위한 도구다.

## 렌더링과 requestAnimationFrame

`requestAnimationFrame`은 브라우저가 다음 페인트 전에 실행할 콜백을 등록하는 API다. 애니메이션이나 화면 측정이 필요한 작업에서 유용하다. 예를 들어 요소를 DOM에 추가한 뒤 실제 크기를 측정하고, 그 측정값으로 애니메이션을 시작해야 할 때 렌더링 타이밍을 고려해야 한다.

AI가 애니메이션이나 스크롤 동작을 구현할 때 단순히 `setTimeout`을 사용하는 경우가 있다. 때로는 충분하지만, 화면 갱신과 맞물린 작업에서는 `requestAnimationFrame`이 더 적절할 수 있다. 중요한 것은 API 이름을 외우는 것이 아니라 "이 작업은 브라우저의 렌더링 타이밍과 어떤 관계가 있는가"를 묻는 것이다.

## 비동기 요청과 race condition

검색 자동완성을 생각해보자. 사용자가 `r`, `re`, `rea`, `react`를 빠르게 입력하면 여러 요청이 순서대로 시작될 수 있다. 하지만 응답은 시작한 순서대로 돌아오지 않는다. `rea` 요청이 `react` 요청보다 늦게 끝나면 오래된 결과가 최신 화면을 덮어쓸 수 있다.

이 문제를 race condition이라고 부른다. AI가 만든 검색 코드는 종종 다음처럼 단순하다.

```js
async function onSearch(keyword) {
  setLoading(true);
  const result = await searchProducts(keyword);
  setItems(result.items);
  setLoading(false);
}
```

이 코드는 성공 케이스에서는 잘 작동한다. 그러나 요청 취소, 오래된 응답 무시, 컴포넌트 unmount, 에러 상태를 고려하지 않는다. 실무에서는 다음 중 하나 이상의 전략이 필요하다.

- AbortController로 이전 요청을 취소한다.
- 요청 id를 기록해 최신 요청의 응답만 반영한다.
- TanStack Query나 SWR 같은 서버 상태 도구에 캐시와 동기화를 맡긴다.
- 입력값 변경과 실제 요청 사이에 debounce를 둔다.

AI에게 검색 기능을 만들게 할 때는 "빠른 입력에서 오래된 응답이 최신 결과를 덮어쓰지 않게 해줘"라고 명시해야 한다.

## stale closure

프론트엔드에서 자주 생기는 또 다른 문제는 stale closure다. 함수가 만들어진 시점의 값을 기억하고, 나중에 실행될 때 최신 값을 보지 못하는 상황이다. React 훅을 사용하는 코드에서 특히 자주 마주친다.

예를 들어 interval 안에서 상태를 읽는 코드가 처음 렌더링의 값을 계속 참조할 수 있다. 이벤트 리스너를 등록하면서 최신 props나 state를 반영하지 못할 수도 있다. AI가 effect dependency를 대충 비워두거나, lint 경고를 피하려고 의존성을 제거하면 이런 문제가 생긴다.

stale closure를 피하려면 다음 질문을 해야 한다.

- 이 콜백은 언제 만들어지고 언제 실행되는가?
- 콜백 안에서 읽는 값은 최신이어야 하는가?
- 의존성 배열이 실제 의존성을 반영하는가?
- ref를 써야 하는 상황인가, 아니면 구조를 바꿔야 하는가?

AI가 만든 훅 코드는 반드시 effect dependency와 cleanup을 확인해야 한다.

## 중복 제출과 사용자 입력

폼 제출도 비동기 흐름의 전형적인 문제다. 사용자가 저장 버튼을 두 번 누르면 요청이 두 번 나갈 수 있다. 첫 번째 요청은 실패하고 두 번째 요청은 성공할 수도 있다. 낙관적 업데이트를 했다가 실패했을 때 UI를 되돌리지 않을 수도 있다.

좋은 폼 제출 흐름은 다음 상태를 명시적으로 다룬다.

- idle
- validating
- submitting
- success
- error

상태를 단순히 `isLoading` 하나로 끝내면 에러 메시지, 중복 클릭 방지, 재시도, 제출 후 이동 같은 흐름이 뒤엉킨다. AI가 만든 코드가 `try/catch`와 `setLoading(false)`만으로 끝난다면, 실제 사용자 흐름을 충분히 다루는지 확인해야 한다.

## 취소와 cleanup

프론트엔드 코드는 컴포넌트 생명주기와 함께 움직인다. 사용자가 페이지를 떠나면 진행 중인 요청은 더 이상 필요 없을 수 있다. 모달이 닫히면 이벤트 리스너를 제거해야 한다. 타이머를 만들었다면 cleanup해야 한다.

AbortController는 fetch 요청을 취소할 때 유용하다. effect cleanup은 이벤트 리스너, interval, observer를 정리할 때 필요하다. AI는 종종 "추가하는 코드"는 잘 만들지만 "정리하는 코드"를 빼먹는다. 프론트엔드에서는 빼먹은 cleanup이 메모리 누수, 중복 이벤트, 이상한 상태 업데이트로 이어질 수 있다.

## 상태 전이를 명시하기

비동기 UI는 시간에 따라 상태가 바뀐다. 이 상태 전이를 코드에서 명시하면 버그를 줄일 수 있다. 단순한 기능은 boolean 몇 개로 충분하지만, 복잡한 기능은 union type이나 state machine이 더 적합할 수 있다.

예를 들어 다음 타입은 `loading`과 `error`가 동시에 true가 되는 모순을 막는다.

```ts
type AsyncState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: Error };
```

AI에게 "로딩과 에러 상태를 처리해줘"라고 말하면 여러 boolean을 만들 수 있다. "상태가 서로 배타적인 union type으로 표현되게 해줘"라고 말하면 더 안전한 구조를 얻기 쉽다.

## AI 생성 코드 리뷰 질문

자바스크립트 런타임과 이벤트 루프 관점에서 AI가 만든 코드를 리뷰할 때는 다음을 확인한다.

- 요청이 취소 가능하거나 오래된 응답을 무시하는가?
- 컴포넌트가 사라진 뒤 상태를 업데이트하지 않는가?
- 이벤트 리스너, 타이머, observer가 cleanup되는가?
- effect dependency가 실제 의존성을 반영하는가?
- 중복 클릭과 중복 제출을 막는가?
- 로딩, 성공, 실패, 취소 상태가 구분되는가?
- 렌더링마다 비싼 비동기 작업을 새로 시작하지 않는가?
- Promise rejection이 조용히 사라지지 않는가?

비동기 버그는 재현이 어렵고, 사용자의 기기와 네트워크 상태에 따라 다르게 나타난다. 그래서 더더욱 처음부터 시간의 흐름을 설계해야 한다. AI는 코드를 빠르게 만들지만, 시간의 의미는 개발자가 붙잡아야 한다.

## 출처

- MDN Web Docs, Event loop: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop
- MDN Web Docs, Promise: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
- MDN Web Docs, AbortController: https://developer.mozilla.org/en-US/docs/Web/API/AbortController
- MDN Web Docs, requestAnimationFrame: https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
