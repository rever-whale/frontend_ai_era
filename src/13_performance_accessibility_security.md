# 13. 성능, 접근성, 보안의 최소 기준

프론트엔드 품질은 기능이 작동하는지로 끝나지 않는다. 빠르게 로드되는가, 키보드와 스크린 리더로 사용할 수 있는가, 민감한 정보를 안전하게 다루는가도 품질의 일부다. AI가 만든 UI는 시각적으로 그럴듯해도 이 세 기준을 놓치는 경우가 많다.

이 장은 성능, 접근성, 보안을 전문가 수준으로 깊게 다루지는 않는다. 대신 프론트엔드 개발자가 자동생성 코드를 받아들일 때 반드시 지켜야 할 최소 기준을 정리한다. 최소 기준은 팀이 반복해서 적용할 수 있어야 한다. 체크리스트, 자동 검사, 리뷰 질문, 브라우저 확인으로 연결되어야 한다.

## 최소 기준이 필요한 이유

AI가 만든 코드는 빠르게 늘어난다. 빠르게 늘어나는 코드에 매번 깊은 전문가 리뷰를 붙일 수는 없다. 그래서 팀에는 최소 기준이 필요하다. 최소 기준은 "이 정도는 항상 확인한다"는 약속이다.

예를 들어 다음 같은 기준을 둘 수 있다.

- 새 이미지 UI는 width/height 또는 aspect ratio를 가져야 한다.
- 새 interactive element는 keyboard로 조작 가능해야 한다.
- 새 form input은 label과 error message 연결을 가져야 한다.
- 새 API 호출은 로딩/에러/빈 상태를 구분해야 한다.
- 새 외부 의존성은 번들 크기와 대체재를 검토해야 한다.
- 클라이언트 번들에는 secret이 들어가면 안 된다.

이 기준은 완벽하지 않지만 반복 가능하다. 반복 가능한 기준이 있어야 AI 생성 코드도 팀의 품질 체계 안에 들어온다.

## 성능 최소 기준

성능은 사용자 경험이다. 사용자는 "React가 느리다"거나 "hydration 비용이 크다"고 말하지 않는다. 그냥 화면이 늦게 뜨고, 클릭이 늦게 반응하고, 스크롤이 끊긴다고 느낀다.

프론트엔드에서 최소한 확인해야 할 성능 기준은 다음과 같다.

- 이미지와 비디오의 크기, 비율, lazy loading이 적절한가?
- 큰 라이브러리를 새로 추가하지 않았는가?
- 렌더링마다 비싼 계산을 반복하지 않는가?
- 목록 rendering에 안정적인 key를 사용하는가?
- 검색, 스크롤, resize 이벤트에 debounce/throttle 또는 적절한 최적화가 있는가?
- 클라이언트에서 실행할 필요 없는 코드를 브라우저로 보내지 않는가?
- LCP, INP, CLS에 영향을 줄 수 있는 변경인지 검토했는가?

AI가 만든 UI는 종종 데모 데이터에서는 빠르다. 하지만 실제 데이터가 100개, 1,000개로 늘어나면 달라진다. 성능 리뷰는 "지금 내 컴퓨터에서 괜찮다"보다 "사용자 조건에서 어떤 비용이 생기는가"를 묻는다.

## 접근성 최소 기준

접근성은 별도의 기능이 아니다. UI가 제대로 만들어졌는지를 보는 기준이다. HTML의 의미를 올바르게 사용하면 접근성뿐 아니라 테스트와 유지보수도 좋아진다.

최소 기준은 다음과 같다.

- 클릭 가능한 것은 `button` 또는 적절한 `a` 요소를 사용한다.
- form input에는 label이 있다.
- error message는 관련 input과 연결된다.
- icon-only button에는 접근 가능한 이름이 있다.
- modal, dropdown, popover는 focus 흐름을 고려한다.
- 키보드만으로 주요 기능을 사용할 수 있다.
- 색상만으로 상태를 전달하지 않는다.
- ARIA는 native HTML로 해결할 수 없을 때만 신중히 사용한다.

AI는 때때로 `div`에 `onClick`을 붙여 버튼처럼 만든다. 시각적으로는 같아 보여도 키보드와 스크린 리더 경험은 다르다. 리뷰어는 눈에 보이는 모양뿐 아니라 상호작용의 의미를 봐야 한다.

## 보안 최소 기준

프론트엔드 보안의 최소 기준은 "브라우저에 들어가는 것은 사용자가 볼 수 있고 조작할 수 있다"는 사실에서 출발한다.

확인할 항목은 다음과 같다.

- secret, private token, 서버 전용 API key가 클라이언트 번들에 들어가지 않는가?
- 인증 정보를 localStorage에 저장하는 결정을 무심코 하지 않았는가?
- 사용자 입력이나 외부 HTML을 안전하게 렌더링하는가?
- `dangerouslySetInnerHTML` 또는 raw HTML 렌더링에 sanitize가 있는가?
- URL을 만들 때 위험한 scheme을 허용하지 않는가?
- 에러 메시지와 로그가 개인정보를 노출하지 않는가?
- dependency 추가 시 보안과 유지보수 상태를 확인했는가?

AI가 보안에 취약한 코드를 악의적으로 만드는 것은 아니다. 다만 맥락을 모른 채 가장 흔한 예제를 제안할 수 있다. 흔한 예제가 안전한 예제라는 뜻은 아니다.

## 성능, 접근성, 보안은 서로 연결된다

이 세 기준은 따로 떨어져 있지 않다. 의미 있는 HTML은 접근성을 높이고 테스트를 쉽게 하며, JavaScript 의존을 줄여 성능에도 도움이 될 수 있다. 이미지 크기와 layout 안정성은 성능 지표뿐 아니라 사용자의 조작 안정성과도 연결된다. 안전한 데이터 처리는 보안뿐 아니라 에러 UX와 운영 신뢰성에도 영향을 준다.

예를 들어 모달을 생각해보자. 성능 관점에서는 불필요한 렌더링과 무거운 content loading을 피해야 한다. 접근성 관점에서는 focus trap, aria 속성, 키보드 닫기, 배경 inert 처리를 봐야 한다. 보안 관점에서는 모달 안에 렌더링하는 외부 HTML이나 사용자 입력을 확인해야 한다. 하나의 UI에도 세 기준이 함께 들어 있다.

## 사례: 그럴듯한 상품 카드 리뷰

AI가 상품 카드를 다음처럼 만들었다고 하자.

```tsx
function ProductCard({ product }: { product: Product }) {
  return (
    <div className="card" onClick={() => location.href = `/products/${product.id}`}>
      <img src={product.imageUrl} />
      <h3>{product.name}</h3>
      <p>{product.priceText}</p>
      <div onClick={() => toggleFavorite(product.id)}>♡</div>
    </div>
  );
}
```

시각적으로는 카드가 보이고, 클릭도 동작한다. 하지만 최소 기준으로 보면 문제가 많다.

- 카드 전체가 `div` click으로 구현되어 키보드 접근성이 낮다.
- 즐겨찾기 버튼도 `div`라서 accessible name이 없다.
- 이미지에 `alt`, `width`, `height` 또는 `aspect-ratio`가 없다.
- 카드 클릭과 즐겨찾기 클릭 이벤트가 충돌할 수 있다.
- `location.href` 직접 변경은 라우터 패턴을 우회할 수 있다.
- 가격이나 이름에 외부 데이터가 들어올 때 렌더링 맥락을 확인해야 한다.

개선된 구조는 다음처럼 더 명시적이다.

```tsx
function ProductCard({ product, onFavoriteToggle }: ProductCardProps) {
  return (
    <article className="card">
      <a href={`/products/${product.id}`} className="cardLink">
        <img
          src={product.imageUrl}
          alt=""
          width="320"
          height="240"
          loading="lazy"
        />
        <h3>{product.name}</h3>
        <p>{product.priceText}</p>
      </a>
      <button
        type="button"
        aria-pressed={product.isFavorite}
        aria-label={`${product.name} 즐겨찾기 ${product.isFavorite ? "해제" : "추가"}`}
        onClick={() => onFavoriteToggle(product.id)}
      >
        ♡
      </button>
    </article>
  );
}
```

이 예제의 핵심은 모든 코드를 완벽하게 만들었다는 것이 아니다. 최소 기준이 코드 구조를 바꾼다는 점이다. 접근성을 고려하면 `div` 대신 `a`와 `button`이 보이고, 성능을 고려하면 이미지 크기와 lazy loading이 보이며, 기존 라우팅 규칙을 고려하면 직접 `location.href`를 쓰지 않는 판단이 생긴다.

## AI에게 품질 검토를 요청하는 법

AI에게도 품질 검토를 시킬 수 있다. 다만 "문제 찾아줘"보다 기준을 주는 편이 좋다.

```text
이 컴포넌트를 성능, 접근성, 보안 관점에서 검토해줘.
특히 이미지 layout shift, keyboard navigation, icon button label,
사용자 입력 렌더링, 클라이언트 번들 secret 노출 가능성을 확인해줘.
확실하지 않은 부분은 실제 브라우저나 도구로 확인해야 한다고 표시해줘.
```

AI의 검토는 1차 점검이다. 실제 접근성은 키보드로 조작해보고, 실제 성능은 브라우저 도구로 측정하고, 실제 보안은 팀의 보안 기준과 함께 확인해야 한다.

## 팀 체크리스트로 만들기

최소 기준은 개인의 기억에만 의존하면 사라진다. 팀은 이를 체크리스트와 자동화로 만들어야 한다.

- PR template에 성능/접근성/보안 확인 항목을 넣는다.
- lint와 type check를 CI에 넣는다.
- 핵심 UI에 컴포넌트 테스트와 E2E 테스트를 둔다.
- 접근성 자동 검사를 가능한 범위에서 추가한다.
- 번들 분석 또는 dependency review를 주기적으로 한다.
- 보안상 민감한 저장소 사용 규칙을 문서화한다.

AI 시대에는 이런 운영 장치가 더 중요하다. 사람이 모든 줄을 직접 쓰지 않는다면, 시스템이 최소 품질을 반복해서 확인해야 한다.

## 병합 전 최소 질문

성능, 접근성, 보안 관점에서 병합 전 다음 질문을 던진다.

- 이 변경이 사용자에게 느려짐으로 느껴질 수 있는가?
- 주요 상호작용을 키보드로 수행할 수 있는가?
- 스크린 리더가 이해할 수 있는 이름과 구조가 있는가?
- 브라우저에 저장하거나 노출하는 값이 안전한가?
- 외부 입력을 HTML이나 URL로 사용할 때 검증하는가?
- 새 의존성은 정말 필요한가?
- 자동 검사로 잡지 못하는 부분을 수동으로 확인했는가?

이 질문은 AI가 만든 코드에만 적용되는 것이 아니다. 모든 프론트엔드 코드에 적용된다. 다만 AI가 코드 생성 속도를 높였기 때문에, 이 질문을 더 자주 더 체계적으로 던져야 한다.

## Part 4 실습과 회고

이 Part의 목표는 자동생성 코드를 읽고, 위험을 찾고, 검증 가능한 변경으로 바꾸는 것이다. 코드를 많이 쓰는 훈련보다 diff를 읽는 훈련을 먼저 한다.

실습 과제:

- AI에게 작은 기능 하나를 일부러 넓은 지시문으로 만들게 한다. 예를 들어 "상품 카드 컴포넌트를 만들어줘"처럼 요구사항을 덜 준다.
- 생성된 diff에서 요구사항, 기존 패턴, 상태 흐름, 접근성, 성능, 보안 관점의 리뷰 코멘트를 각각 하나씩 작성한다.
- 리뷰 코멘트를 다시 AI에게 전달해 개선안을 받는다.
- 개선된 diff에서 테스트로 고정할 수 있는 항목과 수동 확인이 필요한 항목을 분리한다.
- 최종적으로 병합 전 보고 형식을 작성한다.

회고 질문:

- AI가 그럴듯하게 만들었지만 요구사항을 놓친 부분은 무엇인가?
- 내가 직접 diff에서 확인하지 않고 AI 요약만 믿은 부분은 없었는가?
- 테스트로 고정한 위험과 수동 확인으로 남긴 위험은 무엇인가?
- 접근성, 성능, 보안 질문이 PR 템플릿에 남아 있는가?

완료 체크:

- 나쁜 초안 diff 하나를 리뷰했다.
- 개선 요청 프롬프트를 작성했다.
- 테스트 가능한 항목과 수동 검증 항목을 분리했다.
- 병합 전 최소 질문에 답했다.

## 출처

- web.dev, Learn Performance: https://web.dev/learn/performance/
- web.dev, Learn Accessibility: https://web.dev/learn/accessibility/
- web.dev, Core Web Vitals: https://web.dev/vitals/
- MDN Web Docs, Accessibility: https://developer.mozilla.org/en-US/docs/Web/Accessibility
- OWASP Cheat Sheet Series: https://cheatsheetseries.owasp.org/
