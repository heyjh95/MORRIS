# MORIS 웹사이트

한국어·영어로 제공하는 정적 웹사이트입니다. 두 페이지의 공통 구조는 템플릿 한 곳에서 관리합니다.

## 실행과 빌드

Node.js 22 이상을 사용합니다.

```bash
npm ci
npm run build
npm test
```

웹 서버에서 루트 `index.html`을 열면 한국어 페이지로 이동합니다. HTML은 브라우저에서 추가 생성하지 않으므로 자바스크립트가 꺼져 있어도 제품 설명을 읽을 수 있습니다.

## 수정할 파일

| 바꿀 내용 | 원본 |
| --- | --- |
| 공통 페이지 틀 | `templates/page.html` |
| 헤더·카드·카테고리·브랜드 마크업 | `templates/partials/` |
| 메뉴 주소·제품 ID·이미지 경로 | `data/site.json` |
| 한국어 문구 | `data/ko.json` |
| 영어 문구 | `data/en.json` |
| 화면 동작 | `js/main.js` |
| 스타일 진입점 | `scss/layout.scss` |
| 헤더·메인·제품·브랜드 스타일 | `scss/_header.scss` 등 역할별 파일 |
| 사용하는 색·폭·브레이크포인트·겹침 순서 | `scss/_vars.scss` |

`html/index.html`, `html/en.html`, `css/layout.css`, `css/layout.min.css`는 빌드 결과입니다. 원본을 고치고 `npm run build`로 다시 생성합니다. 실제 페이지는 압축 CSS를 읽으며, 일반 CSS는 생성 결과를 살펴볼 때 사용합니다.

미정 목적지는 `<a href="#">`로 작성합니다. 실제 섹션이 있는 메뉴의 `#products`, `#brands`와 언어 전환 주소는 해당 위치를 가리킵니다.

## 템플릿을 읽는 방법

`{{title}}`은 HTML 특수 문자를 처리하는 텍스트 자리입니다. `{{{cards}}}`는 빌드 스크립트가 만든 HTML 조각을 넣는 자리입니다. 반복은 `scripts/build-html.mjs`의 `map()`에서 처리합니다. 외부 템플릿 라이브러리는 사용하지 않습니다.

카테고리를 추가할 때는 `data/site.json`에 ID·이미지를, 두 언어 데이터의 같은 ID에 제목·설명을 추가합니다. 브랜드도 같은 구조이며, 브랜드 선택과 패널을 연결하는 CSS 규칙은 `scss/_brands.scss`에 함께 추가합니다.

## 검증과 학습 자료

CI는 잠금 파일로 설치하고 HTML·CSS를 빌드한 뒤 커밋된 결과와 비교합니다. 테스트는 생성 결과, ID·참조 경로, 메뉴 일치, 카테고리 연결, 브랜드 CSS 연결과 텍스트 처리를 검사합니다.

현재 코드의 설명은 [학습 안내](study/README.md)와 [현행 코드 해설](study/current-code-guide.md)에 있습니다. 기존 줄별 해설은 변경 전 코드의 보관본입니다. 실험용 스타일은 `study/examples/`에서 따로 관리합니다.
