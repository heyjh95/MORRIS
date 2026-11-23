# MORIS 코드 학습 안내

현재 코드는 HTML을 직접 수정하고, 네 영역의 전환을 Swiper로 처리합니다. 먼저 [현행 코드 해설](current-code-guide.md)을 읽고 화면의 한 영역씩 따라가세요.

## 파일을 읽는 순서

```text
html/index.html 또는 html/en.html   문구·이미지·링크
  ├─ scss/_reset.css               기본 글꼴·초기화·hidden
  ├─ css/layout.min.css            빌드한 화면 스타일
  └─ js/main.js                    기능별 Swiper와 메뉴

scss/layout.scss                  CSS 빌드 진입점
  ├─ _common.scss                 공통 컨테이너·제목·버튼
  ├─ _header.scss                 헤더와 전체 메뉴
  ├─ _hero.scss                   메인 비주얼
  ├─ _floating.scss               고정 팝업
  ├─ _new-products.scss           신제품
  ├─ _brand-message.scss          브랜드 메시지
  ├─ _product-categories.scss     제품 카테고리
  ├─ _brands.scss                 브랜드
  └─ _motion.scss                 움직임 줄이기 설정
```

HTML은 저장 후 새로고침합니다. SCSS는 수정 후 `npm run build`를 실행합니다. 구조를 변경하면 `npm test`로 연결을 검사하고 브라우저에서도 직접 눌러 봅니다.

## 변경 전 코드의 줄별 해설

아래 문서는 과거 코드의 보관본입니다. 줄 번호·클래스·파일 위치가 현재와 다릅니다. 현재 수정 방법은 현행 코드 해설을 기준으로 읽으세요.

1. [HTML](01_html_line_by_line.md)
2. [SCSS](02_scss_line_by_line.md)
3. [JavaScript](03_js_line_by_line.md)
4. [변수와 믹스인](04_vars_mixins_line_by_line.md)
5. [초기화 CSS와 진입점](05_reset_entry_line_by_line.md)
6. [실험용 스타일](06_layout_test_line_by_line.md)

실험용 SCSS와 사용하지 않는 학습용 믹스인은 `study/examples/`에서 따로 보관합니다.
