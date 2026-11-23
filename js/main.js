"use strict";

// 함수 하나가 화면의 기능 하나를 맡는다.
function initHeroSlider() {
  const hero = document.querySelector(".main-visual");
  if (!hero) return;

  const cards = hero.querySelectorAll(".swiper-pagination-bullet");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function showCurrentCard(index) {
    cards.forEach((card, cardIndex) => {
      const isCurrent = cardIndex === index;
      card.classList.toggle("swiper-pagination-bullet-active", isCurrent);
      card.querySelector(".main-visual__select").setAttribute("aria-current", String(isCurrent));
    });
  }

  if (typeof window.Swiper !== "function") {
    showCurrentCard(0);
    return;
  }

  const slider = new Swiper(hero, {
    slidesPerView: 1,
    loop: true,
    speed: prefersReducedMotion ? 0 : 800,
    autoplay: prefersReducedMotion ? false : { delay: 4000, disableOnInteraction: false },
    grabCursor: true,
    on: {
      init(swiper) { showCurrentCard(swiper.realIndex); },
      slideChange(swiper) { showCurrentCard(swiper.realIndex); },
    },
  });

  cards.forEach((card, index) => {
    // button은 Enter와 Space도 click으로 처리한다.
    card.querySelector(".main-visual__select").addEventListener("click", () => {
      slider.slideToLoop(index);
    });
  });
}

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

function initFloatingPanel() {
  const floating = document.querySelector(".floating");
  if (!floating) return;
  const closeButton = floating.querySelector(".floating__close");
  if (!closeButton) return;

  closeButton.addEventListener("click", () => {
    // _reset.css의 [hidden] 규칙이 display:flex보다 우선해 숨긴다.
    floating.hidden = true;
  });
}

function initProductCategories() {
  document.querySelectorAll(".product-categories").forEach((categories) => {
    const buttons = categories.querySelectorAll(".product-categories__button");
    const panels = categories.querySelectorAll(".product-categories__panel");
    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const panelId = button.getAttribute("aria-controls");
        const target = document.getElementById(panelId);
        if (!target || !categories.contains(target)) return;

        buttons.forEach((item) => {
          item.setAttribute("aria-pressed", String(item === button));
        });
        panels.forEach((panel) => {
          panel.hidden = panel !== target;
        });
      });
    });
  });
}

function initNavigation() {
  const header = document.querySelector(".header");
  if (!header) return;
  const toggle = header.querySelector(".header__menu-toggle");
  const drawer = header.querySelector(".header__drawer");
  if (!toggle || !drawer) return;

  // 언어별 문구는 템플릿이 data-* 속성으로 전달한다.
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
initFloatingPanel();
initProductCategories();
initNavigation();
