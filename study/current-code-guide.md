# MORIS 현행 코드 해설

이 문서는 2026년 11월 23일 구조 정리 이후의 코드 흐름을 설명합니다. 줄 번호 대신 파일과 함수·클래스 이름을 기준으로 찾아갑니다.

## HTML은 데이터와 틀을 합쳐 만든다

`data/site.json`은 이미지 경로, 항목 ID, 메뉴 주소를 담습니다. `data/ko.json`과 `data/en.json`은 같은 ID의 한국어·영어 문구를 담습니다. ID로 연결하므로 문구 순서를 바꿔도 다른 제품 설명과 섞이지 않습니다.

`scripts/build-html.mjs`의 `renderPage()`는 데이터를 읽고 각 템플릿에 값을 넣습니다. `map()`으로 항목마다 HTML 조각을 만들고 `join("")`으로 합칩니다. 두 메뉴도 같은 메뉴 데이터에서 만듭니다.

`{{title}}` 자리에는 일반 텍스트를 넣습니다. `escapeHtml()`은 `&`, `<`, `>`, 따옴표를 HTML 문자 표현으로 바꿉니다. `{{{panels}}}`처럼 중괄호가 세 개인 자리는 이미 만든 HTML 조각을 넣습니다.

미구현 링크는 `href="#"`입니다. 메인 카드의 선택 버튼과 상세 링크는 나란히 있어, 상세 링크를 눌렀을 때 슬라이드 선택 이벤트가 함께 실행되지 않습니다.

## 클래스 이름은 화면의 역할을 나타낸다

| 이전 이름 | 현재 이름 |
| --- | --- |
| `product` | `new-products` |
| `product2` | `product-categories` |
| `product3` | `brands` |
| `main2title` | `brand-message` |
| `.gnb .ul` | `.gnb__list` |

`__` 뒤는 해당 영역의 요소를 뜻합니다. 예를 들어 `product-categories__button`은 제품 카테고리를 선택하는 버튼입니다. SCSS에는 실제 생성될 선택자를 직접 적어 중첩을 따라가며 해석하는 일을 줄였습니다.

## JavaScript는 기능별 함수로 시작한다

`main.js`의 맨 아래에서 초기화 함수를 차례로 호출합니다.

- `initHeroSlider()`: 메인 슬라이드와 현재 카드 표시를 연결합니다. 선택은 네이티브 버튼이므로 Enter·Space 처리를 따로 작성하지 않습니다.
- `initProductSlider()`: 신제품 슬라이드의 화면별 개수를 설정합니다. Swiper가 버튼 이름을 덮어쓰지 않도록 HTML의 번역 문구를 전달합니다.
- `initFloatingPanel()`: 닫기 버튼을 누르면 `hidden = true`로 바꿉니다.
- `initProductCategories()`: 선택 버튼의 `aria-controls`와 패널 ID를 연결합니다. 선택 상태와 표시 패널을 함께 바꿉니다.
- `initNavigation()`: 메뉴를 열고 닫으며 포커스를 관리합니다.

메뉴 버튼은 `if (drawer.hidden)`으로 열기·닫기를 나눕니다. `openMenu()`는 첫 링크에 포커스를 보내고, `closeMenu()`는 기본적으로 메뉴 버튼으로 되돌립니다. 메뉴 링크를 눌러 섹션으로 이동할 때는 `closeMenu(false)`로 되돌림을 생략합니다.

언어별 메뉴 이름은 템플릿의 `data-open-label`과 `data-close-label`에 있습니다. JavaScript는 언어 조건을 다시 중첩해 계산하지 않습니다. Tab 순환 배열에는 닫기 버튼도 포함합니다.

`querySelectorAll()`은 NodeList를 반환합니다. `forEach()`만 필요하면 배열로 바꾸지 않고 바로 순회합니다. 앞뒤 요소를 조합해야 하는 메뉴 포커스 목록에서만 배열 전개를 사용합니다.

## 카드 숫자와 브랜드 선택 규칙

메인 카드의 전체 높이는 `$hero-card-height: 270px`, 접혔을 때 노출 높이는 `$hero-card-peek: 120px`입니다. 배경의 접힘 비율은 120 ÷ 270이고 내용의 이동 거리는 270 − 120 = 150px입니다. `_hero.scss`는 이 값을 변수에서 계산합니다.

브랜드는 HTML 라디오 버튼의 기본 방향키 동작을 사용합니다. 다음 선택자는 JUSTCLICK을 선택했을 때 해당 패널을 보여 줍니다.

```css
.brands:has(#brand-justclick:checked) .brands__panel--justclick {
  display: grid;
}
```

`:checked`는 선택된 라디오를 찾고, `:has(...)`는 그 라디오를 가진 브랜드 영역을 찾습니다. 마지막 부분은 표시할 패널입니다. 나머지 브랜드도 같은 방식으로 연결됩니다.

## 실제 스타일과 실험 코드를 구분한다

기본 글꼴과 `[hidden] { display: none !important; }`는 `_reset.css`에 한 번 둡니다. 이 숨김 규칙 때문에 `display: flex`인 팝업도 `hidden`으로 닫힙니다.

실제 사이트용 믹스인은 가운데 정렬과 말줄임 두 개입니다. 배경과 반복 그림자는 `study/examples/`의 학습용 믹스인으로 옮겼습니다. 실제 빌드는 `scss/layout.scss`만 진입점으로 사용합니다.

스타일·템플릿을 수정한 뒤 `npm run build`, `npm test`를 실행합니다. 브라우저에서는 새로고침한 뒤 메뉴, 카테고리, 브랜드와 두 언어를 확인합니다.
