# MORIS 코드 학습 안내

현재 사이트는 공통 템플릿과 언어별 데이터에서 HTML을 생성합니다. 먼저 [현행 코드 해설](current-code-guide.md)을 읽고 실제 원본 파일을 함께 확인하세요.

## 현재의 파일 연결

```text
data/site.json + data/ko.json 또는 data/en.json
  └─ scripts/build-html.mjs + templates/
       └─ html/index.html 또는 html/en.html

scss/layout.scss
  ├─ _header.scss
  ├─ _hero.scss
  ├─ _floating.scss
  ├─ _new-products.scss
  ├─ _brand-message.scss
  ├─ _product-categories.scss
  ├─ _brands.scss
  └─ _motion.scss
       └─ css/layout.css와 css/layout.min.css

HTML
  ├─ scss/_reset.css  기본 글꼴·초기화·hidden 처리
  ├─ css/layout.min.css  화면 스타일
  └─ js/main.js  기능별 초기화 함수
```

## 변경 전 코드의 줄별 해설

아래 문서는 과거 코드의 설명을 보관한 자료입니다. 줄 번호·클래스 이름·파일 위치가 현재와 다릅니다. reset 이중 로딩이나 옛 Swiper 설정처럼 이미 변경된 내용도 과거 상태를 설명합니다.

1. [HTML](01_html_line_by_line.md)
2. [SCSS](02_scss_line_by_line.md)
3. [JavaScript](03_js_line_by_line.md)
4. [변수와 믹스인](04_vars_mixins_line_by_line.md)
5. [초기화 CSS와 진입점](05_reset_entry_line_by_line.md)
6. [실험용 스타일](06_layout_test_line_by_line.md)

실험 파일은 [examples/layout.scss](examples/layout.scss)로 옮겼습니다. 그림자 반복문과 배경 믹스인은 [examples/_mixins.scss](examples/_mixins.scss)에 있으며 실제 사이트 빌드에 포함되지 않습니다.
