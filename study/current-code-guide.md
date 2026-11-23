# MORIS 현행 코드 해설

HTML에서 내용을 고치고, JavaScript에서 동작을 읽고, SCSS에서 모양을 고치는 순서로 설명합니다. 2026년 11월 23일의 직접 편집 구조를 기준으로 합니다.

## 1 HTML에서 문구와 이미지를 고친다

한국어는 `html/index.html`, 영어는 `html/en.html`을 엽니다. 영역 이름을 적은 주석을 검색하세요.

```html
<!-- 신제품 -->
<section class="new-products container" id="products">
```

문구는 태그 사이에서, 이미지는 `src`에서, 이동 주소는 `href`에서 바꿉니다. 아직 목적지가 없는 링크는 `href="#"`로 둡니다. 내용을 고친 뒤 저장하고 브라우저를 새로고침하면 됩니다.

두 언어의 내용은 각각 수정합니다. 가로 메뉴와 전체 메뉴도 같은 목록을 두 곳에 직접 적습니다. 한 곳의 메뉴를 고치면 같은 페이지의 다른 메뉴도 고칩니다. `npm test`가 두 메뉴의 주소·문구 차이를 찾아 줍니다.

## 2 공통 클래스 위에 영역의 차이를 적는다

```html
<h2 class="section-title new-products__title">NEW PRODUCT</h2>
<a class="button new-products__all-link" href="#">All product</a>
```

| 클래스 | 맡는 일 |
| --- | --- |
| `container` | 내용의 최대 폭과 가운데 정렬 |
| `section-title` | 제목의 기본 글자 크기·굵기·줄 높이·색 |
| `button` | 링크 버튼의 정렬·둥근 모서리·색 전환·포커스 표시 |
| `new-products__title` | 신제품 제목을 찾는 이름. 기본 모양은 `section-title`에서 관리 |

공통 선언은 `scss/_common.scss`에 있습니다. 신제품·제품 카테고리·브랜드 제목은 같은 크기·700 굵기·1.2 줄 높이를 사용합니다. 모바일 크기는 32px입니다. 세 영역의 가로 여백과 최대 콘텐츠 폭은 `_vars.scss`의 `$section-padding-inline`과 `$section-content-width`로 맞춥니다.

`layout.scss`는 공통 스타일을 먼저 읽고 헤더 → 메인 → 신제품 → 카테고리 → 브랜드 순서로 읽습니다. `__` 뒤는 영역 안의 요소를 뜻합니다. `brands__image`는 브랜드 영역의 이미지입니다.

## 3 네 가지 전환을 같은 방식으로 읽는다

`js/main.js`에는 영역별 초기화 함수가 있습니다.

| 함수 | Swiper 설정 |
| --- | --- |
| `initHeroSlider()` | 메인 이미지를 넘기며 데스크톱은 자동 재생, 모바일은 수동 조작 |
| `initProductSlider()` | 화면 폭에 따라 신제품을 여러 장 표시 |
| `initCategorySlider()` | 선택한 카테고리를 즉시 표시 |
| `initBrandSlider()` | 선택한 브랜드를 즉시 표시 |

모두 HTML의 `swiper` 안에 `swiper-wrapper`를 두고 그 안에 `swiper-slide`를 넣습니다. HTML의 제목·설명·이미지가 곧 슬라이드 내용입니다. JavaScript에 HTML 문자열이나 번역 배열을 다시 적지 않습니다.

카테고리와 브랜드는 `effect: "fade"`, `speed: 0`으로 제자리에서 바로 바뀝니다. `autoHeight: true`는 선택한 내용에 높이를 맞추고, `allowTouchMove: false`는 드래그 대신 선택 버튼으로 전환하게 합니다.

## 4 버튼과 패널은 ID로 연결한다

```html
<button class="brands__tab" type="button"
        aria-controls="brand-bamboo" aria-pressed="false">
  <img class="brands__tab-image" src="../images/main/brand02.png" alt="BAMBOO" />
</button>

<article class="brands__panel swiper-slide" id="brand-bamboo"
         aria-labelledby="brand-heading-bamboo">
  <!-- 이곳에 BAMBOO 제목·설명·이미지를 둡니다. -->
</article>
```

`aria-controls="brand-bamboo"`가 `id="brand-bamboo"`를 가리킵니다. 선택 버튼과 패널의 순서를 따로 바꿔도 이 연결은 유지됩니다. 실제 패널의 제목에는 `id="brand-heading-bamboo"`가 있어야 합니다.

`connectSlideButtons()`가 메인·카테고리·브랜드에서 공통으로 하는 일은 다음과 같습니다.

1. 버튼을 누르면 `aria-controls`의 ID로 패널을 찾습니다.
2. 그 패널의 위치로 Swiper를 이동합니다.
3. 현재 버튼의 `aria-pressed`를 `true`, 나머지는 `false`로 바꿉니다.
4. 안 보이는 슬라이드에는 `inert`를 적용해 숨은 링크로 Tab이 들어가지 않게 합니다.

`slider.slides`는 Swiper가 관리하는 슬라이드 배열입니다. `activeIndex`는 현재 배열에서 표시 중인 위치입니다. 메인은 `loop`로 슬라이드 순서가 재배치되므로 Swiper가 기록한 원래 번호를 읽어 `slideToLoop()`로 이동합니다.

Enter·Space는 기본 `button` 동작으로 처리합니다. 방향키는 앞뒤 버튼, Home·End는 첫·마지막 버튼으로 이동합니다. 끝을 넘어가면 반대편 버튼을 선택합니다. 브랜드를 추가해도 CSS에 브랜드별 선택 규칙을 더할 필요가 없습니다.

## 5 카테고리나 브랜드를 추가한다

1. 같은 영역의 선택 버튼 하나를 복사합니다.
2. 해당 패널 하나를 `swiper-wrapper` 안에 복사합니다.
3. 새 ID를 만들고 버튼의 `aria-controls`, 패널의 `id`, 제목의 ID와 `aria-labelledby`를 맞춥니다.
4. 처음 선택할 버튼 하나만 `aria-pressed="true"`로 둡니다.
5. 한국어·영어에 같은 ID와 이미지 구성을 추가하고 문구는 각각 번역합니다.
6. `npm test`를 실행하고 브라우저에서 새 버튼을 눌러 봅니다.

번호나 전체 개수를 JavaScript에 추가하지 않아도 됩니다. 메인 카드의 열 개수처럼 개수를 고정한 디자인은 해당 SCSS도 확인합니다.

## 6 메뉴와 팝업을 읽는다

`initNavigation()` 안의 `openMenu()`는 메뉴를 열고 첫 링크로 포커스를 보냅니다. `closeMenu()`는 닫고 메뉴 버튼으로 포커스를 되돌립니다. 섹션 이동 링크를 누를 때는 `closeMenu(false)`로 포커스 복귀를 생략합니다.

열기·닫기 문구는 HTML 헤더의 `data-open-label`, `data-close-label`에서 읽습니다. Escape는 닫기, Tab은 닫기 버튼과 메뉴 링크 사이를 순환합니다.

팝업은 `hidden = true`로 닫습니다. `_reset.css`의 `[hidden] { display: none !important; }`가 `display: flex`보다 우선합니다.

모바일에서는 팝업 대신 하단의 작은 버튼을 먼저 표시합니다. 버튼을 누르면 `.floating`에 `is-open`을 붙이고 `aria-expanded`를 `true`로 바꿉니다. 닫기 버튼·Escape·바깥 클릭은 `closeQuickMenu()`로 메뉴를 접습니다. 데스크톱의 기존 닫기 버튼은 팝업 전체를 숨깁니다.

## 7 숫자의 의미와 빌드 순서

메인 카드의 높이는 `$hero-card-height: 270px`, 접혔을 때 보이는 높이는 `$hero-card-peek: 120px`입니다. 배경 비율은 120 ÷ 270, 내용의 이동 거리는 270 − 120 = 150px입니다. `_hero.scss`에서 이 두 변수로 계산합니다.

HTML은 직접 편집하는 원본입니다. SCSS만 `npm run build`로 CSS를 생성합니다. `npm test`는 파일 경로·ID·버튼 연결·메뉴 일치 등을 검사하므로, 실제 클릭과 키보드 동작은 브라우저에서도 확인합니다.

## 8 모바일에서도 문구를 한 번만 작성한다

메인 제목·설명은 HTML의 `.main-visual__card-content`에서 수정합니다. 모바일용 문구를 따로 복사하지 않습니다.

`initHeroSlider()`의 `arrangeContent()`는 768px 이하에서 설명 요소를 해당 이미지의 `.main-visual__slide` 안으로 옮깁니다. 버튼의 `aria-controls`로 대상 슬라이드를 찾습니다. 화면이 넓어지면 같은 요소를 원래 선택 카드 안으로 되돌립니다. `matchMedia()`의 `change` 이벤트가 화면 크기 기준을 넘었을 때 이 작업을 실행합니다.

모바일 CSS는 각 SCSS 파일 아래의 `@media (max-width: $bp-mobile)` 안에 있습니다. `_hero.scss`는 이미지 전체 표시와 한 화면 구성을, `_new-products.scss`는 제목·버튼의 세로 배치를, `_floating.scss`는 하단 메뉴와 안전 영역 여백을 담당합니다.

메인은 최소 `100dvh`를 채우며 고정 헤더 높이도 포함합니다. 화면이 짧거나 설명이 길면 슬라이드가 내용만큼 늘어납니다. 모바일 이미지 영역에는 `aspect-ratio: 1`을 주고, 이미지에는 `contain`을 써 원본 비율을 유지합니다. 가로나 세로로 긴 원본에는 여백이 생길 수 있습니다. 데스크톱은 `cover`를 사용합니다.

모바일 자동 재생은 `slider.autoplay.stop()`으로 멈추고, 데스크톱으로 돌아오면 기존 설정에 맞춰 다시 시작합니다. 움직임 줄이기 설정에서는 자동 재생을 시작하지 않습니다.

## 9 문구 너비와 카테고리 배치를 조정한다

`initBrandMessage()`는 모바일 문구의 실제 너비와 부모 영역의 너비를 잽니다. 현재 글자 크기에 ‘부모 너비 ÷ 문구 너비’를 곱해 한 줄이 좌우를 채우도록 합니다. 글꼴 로딩과 화면 크기 변경 후에도 다시 계산하고, 데스크톱에서는 지정한 CSS 크기로 되돌립니다.

제품 카테고리의 데스크톱 레이아웃은 두 열입니다. 메뉴는 첫 번째 열, `.product-categories__content`는 두 번째 열입니다. 각 패널은 제목·설명·링크를 먼저 보여 주고 그 아래에 이미지를 놓습니다. 이미지에는 `contain`을 적용하고 확대와 절대 배치를 사용하지 않아 전체가 보입니다.

화살표는 `images/common/icons.svg`의 `symbol`을 HTML의 `svg`와 `use`로 불러옵니다. `.icon`은 정사각형 크기를 정하고, 원형 부모의 flex·grid 정렬이 아이콘을 가운데에 놓습니다. 폰트 글자의 여백에 영향을 받지 않습니다.
