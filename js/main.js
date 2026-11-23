"use strict";

// 1. 메인 비주얼: 한 장씩 넘긴다.
function initHeroSlider() {
  const hero = document.querySelector(".main-visual");
  if (!hero) return;

  const buttons = hero.querySelectorAll(".main-visual__select");
  const mobileScreen = window.matchMedia("(max-width: 768px)");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 문구는 한 번만 작성한다. 모바일에서는 이미지와 같은 슬라이드로 옮긴다.
  const cards = Array.from(hero.querySelectorAll(".main-visual__card"));
  const contents = cards.map((card) => card.querySelector(".main-visual__card-content"));
  function arrangeContent() {
    cards.forEach((card, index) => {
      const panelId = card.querySelector("button").getAttribute("aria-controls");
      const slide = document.getElementById(panelId);
      if (mobileScreen.matches) slide.append(contents[index]);
      else card.append(contents[index]);
    });
  }
  arrangeContent();

  if (typeof window.Swiper !== "function") return;

  const previous = hero.querySelector(".main-visual__prev");
  const next = hero.querySelector(".main-visual__next");
  const slider = new Swiper(hero, {
    slidesPerView: 1,
    loop: true,
    speed: prefersReducedMotion ? 0 : 800,
    autoplay: prefersReducedMotion ? false : { delay: 4000, disableOnInteraction: false },
    autoHeight: mobileScreen.matches,
    grabCursor: true,
    navigation: { prevEl: previous, nextEl: next },
    a11y: {
      prevSlideMessage: previous.getAttribute("aria-label"),
      nextSlideMessage: next.getAttribute("aria-label"),
    },
  });
  connectSlideButtons(slider, buttons);

  function updateLayout() {
    arrangeContent();
    slider.params.autoHeight = mobileScreen.matches;
    // 화면 전환 시 Swiper의 높이 관련 CSS도 같은 상태로 맞춘다.
    hero.classList.toggle("swiper-autoheight", mobileScreen.matches);
    if (mobileScreen.matches || prefersReducedMotion) slider.autoplay.stop();
    else slider.autoplay.start();
    if (!mobileScreen.matches) slider.wrapperEl.style.height = "";
    slider.update();
  }
  updateLayout();
  mobileScreen.addEventListener("change", updateLayout);
}

// 2. 신제품: 화면 폭에 맞춰 여러 장을 보여 준다.
function initProductSlider() {
  const slider = document.querySelector(".new-products__slider");
  if (!slider || typeof window.Swiper !== "function") return;

  const previous = slider.querySelector(".new-products__prev");
  const next = slider.querySelector(".new-products__next");
  new Swiper(slider, {
    slidesPerView: 1.2,
    spaceBetween: 16,
    grabCursor: true,
    breakpoints: {
      576: { slidesPerView: 2, spaceBetween: 16 },
      768: { slidesPerView: 3, spaceBetween: 18 },
      1200: { slidesPerView: 4, spaceBetween: 20 },
    },
    scrollbar: {
      el: slider.querySelector(".new-products__scrollbar"),
      draggable: true, hide: false, snapOnRelease: true,
    },
    navigation: { prevEl: previous, nextEl: next },
    // HTML에서 번역한 이름을 Swiper 초기화 후에도 유지한다.
    a11y: {
      prevSlideMessage: previous.getAttribute("aria-label"),
      nextSlideMessage: next.getAttribute("aria-label"),
    },
  });
}

// 모바일 문구가 왼쪽 여백부터 오른쪽 여백까지 한 줄로 차도록 크기를 맞춘다.
function initBrandMessage() {
  const title = document.querySelector(".brand-message__title");
  if (!title) return;
  const mobileScreen = window.matchMedia("(max-width: 768px)");

  function fitTitle() {
    title.style.fontSize = "";
    if (!mobileScreen.matches) return;
    const textWidth = title.getBoundingClientRect().width;
    const availableWidth = title.parentElement.clientWidth;
    if (!textWidth) return;
    const fontSize = parseFloat(getComputedStyle(title).fontSize);
    title.style.fontSize = (fontSize * availableWidth / textWidth) + "px";
  }

  fitTitle();
  document.fonts.ready.then(fitTitle);
  window.addEventListener("resize", fitTitle);
}

// 3. 제품 카테고리: 애니메이션 없이 선택한 내용을 보여 준다.
function initCategorySlider() {
  const categories = document.querySelector(".product-categories");
  if (!categories || typeof window.Swiper !== "function") return;

  const slider = new Swiper(categories.querySelector(".product-categories__content"), {
    effect: "fade",
    fadeEffect: { crossFade: true },
    speed: 0,
    autoHeight: true,
    allowTouchMove: false,
  });
  connectSlideButtons(slider, categories.querySelectorAll(".product-categories__button"));
}

// 4. 브랜드: 카테고리와 같은 설정으로 내용을 전환한다.
function initBrandSlider() {
  const brands = document.querySelector(".brands");
  if (!brands || typeof window.Swiper !== "function") return;

  const slider = new Swiper(brands.querySelector(".brands__slider"), {
    effect: "fade",
    fadeEffect: { crossFade: true },
    speed: 0,
    autoHeight: true,
    allowTouchMove: false,
  });
  connectSlideButtons(slider, brands.querySelectorAll(".brands__tab"));
}

// 공통 동작: 버튼의 aria-controls에 적힌 ID로 슬라이드를 찾는다.
// 버튼과 슬라이드의 순서를 따로 바꿔도 연결이 유지된다.
function connectSlideButtons(slider, buttons) {
  function updateSelection() {
    const currentSlide = slider.slides[slider.activeIndex];
    buttons.forEach((button) => {
      const isCurrent = button.getAttribute("aria-controls") === currentSlide.id;
      button.setAttribute("aria-pressed", String(isCurrent));
    });
    slider.slides.forEach((slide) => {
      const isCurrent = slide === currentSlide;
      // 안 보이는 슬라이드의 링크에 Tab이 들어가지 않게 한다.
      slide.inert = !isCurrent;
      slide.setAttribute("aria-hidden", String(!isCurrent));
    });
  }

  buttons.forEach((button, buttonIndex) => {
    button.addEventListener("click", () => {
      const panel = document.getElementById(button.getAttribute("aria-controls"));
      if (!panel || !slider.slides.includes(panel)) return;
      if (slider.params.loop) {
        // loop는 슬라이드를 재배치하므로 Swiper가 보관한 원래 번호를 쓴다.
        slider.slideToLoop(Number(panel.dataset.swiperSlideIndex));
      } else {
        slider.slideTo(slider.slides.indexOf(panel));
      }
    });
    button.addEventListener("keydown", (event) => {
      let nextIndex = buttonIndex;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex += 1;
      else if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex -= 1;
      else if (event.key === "Home") nextIndex = 0;
      else if (event.key === "End") nextIndex = buttons.length - 1;
      else return;

      event.preventDefault();
      // 마지막 다음은 첫 버튼, 첫 버튼 이전은 마지막 버튼이다.
      if (nextIndex >= buttons.length) nextIndex = 0;
      if (nextIndex < 0) nextIndex = buttons.length - 1;
      buttons[nextIndex].focus();
      buttons[nextIndex].click();
    });
  });
  slider.on("slideChange", updateSelection);
  updateSelection();
}

// 5. 모바일은 작은 버튼으로 메뉴를 펼치고, 데스크톱은 기존 팝업을 사용한다.
function initFloatingPanel() {
  const floating = document.querySelector(".floating");
  if (!floating) return;
  const closeButton = floating.querySelector(".floating__close");
  if (!closeButton) return;

  closeButton.addEventListener("click", () => {
    // _reset.css의 [hidden] 규칙이 display:flex보다 우선해 숨긴다.
    floating.hidden = true;
  });

  const toggle = floating.querySelector(".floating__toggle");
  const mobileClose = floating.querySelector(".floating__mobile-close");
  function closeQuickMenu(returnFocus = false) {
    floating.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    if (returnFocus) toggle.focus();
  }
  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    floating.classList.toggle("is-open", !isOpen);
    toggle.setAttribute("aria-expanded", String(!isOpen));
  });
  mobileClose.addEventListener("click", () => closeQuickMenu(true));
  floating.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => closeQuickMenu());
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && floating.classList.contains("is-open")) closeQuickMenu(true);
  });
  document.addEventListener("click", (event) => {
    if (!floating.contains(event.target)) closeQuickMenu();
  });
  window.matchMedia("(max-width: 768px)").addEventListener("change", () => closeQuickMenu());
}

// 6. 전체 메뉴: 열기·닫기와 키보드 포커스를 처리한다.
function initNavigation() {
  const header = document.querySelector(".header");
  if (!header) return;
  const toggle = header.querySelector(".header__menu-toggle");
  const drawer = header.querySelector(".header__drawer");
  if (!toggle || !drawer) return;

  // 언어별 문구는 각 HTML의 data-* 속성에서 읽는다.
  const openLabel = header.dataset.openLabel;
  const closeLabel = header.dataset.closeLabel;

  function openMenu() {
    drawer.hidden = false;
    header.classList.add("is-menu-open");
    document.body.classList.add("is-site-menu-open");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", closeLabel);
    drawer.querySelector("a").focus();
  }

  function closeMenu(returnFocus = true) {
    drawer.hidden = true;
    header.classList.remove("is-menu-open");
    document.body.classList.remove("is-site-menu-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", openLabel);
    if (returnFocus) toggle.focus();
  }

  toggle.addEventListener("click", () => {
    if (drawer.hidden) {
      openMenu();
    } else {
      closeMenu();
    }
  });
  drawer.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => closeMenu(false));
  });

  document.addEventListener("keydown", (event) => {
    if (drawer.hidden) return;
    if (event.key === "Escape") {
      closeMenu();
      return;
    }
    if (event.key !== "Tab") return;

    // 닫기 버튼도 메뉴의 Tab 순환에 포함한다.
    const focusable = [toggle, ...drawer.querySelectorAll("a[href], button:not([disabled])")];
    const firstElement = focusable[0];
    const lastElement = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  });
  document.addEventListener("click", (event) => {
    if (!drawer.hidden && !header.contains(event.target)) closeMenu(false);
  });
}

initHeroSlider();
initProductSlider();
initBrandMessage();
initCategorySlider();
initBrandSlider();
initFloatingPanel();
initNavigation();
