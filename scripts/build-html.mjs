import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const read = (path) => readFileSync(resolve(root, path), "utf8");

export function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}

function valueFor(values, key, template) {
  if (!Object.hasOwn(values, key) || values[key] == null) {
    throw new Error(template + ": missing " + key);
  }
  return String(values[key]);
}

// {{name}}은 텍스트, {{{content}}}는 이 스크립트가 만든 HTML 조각이다.
function render(template, values) {
  return read("templates/" + template)
    .replace(/\{\{\{(\w+)\}\}\}/g, (_, key) => valueFor(values, key, template))
    .replace(/\{\{(\w+)\}\}/g, (_, key) => escapeHtml(valueFor(values, key, template)));
}

function renderMenu(site, text, itemClass, linkClass) {
  return site.navigation.map((item) => render("partials/menu-item.html", {
    href: item.href, label: text.navigation[item.key], itemClass, linkClass,
  })).join("");
}

export function renderPage(language) {
  const site = JSON.parse(read("data/site.json"));
  const text = JSON.parse(read("data/" + language + ".json"));
  const labels = text.labels;

  const header = render("partials/header.html", {
    ...labels,
    home: language === "ko" ? "./index.html" : "./en.html",
    koreanCurrent: language === "ko" ? 'aria-current="page"' : "",
    englishCurrent: language === "en" ? 'aria-current="page"' : "",
    primaryMenu: renderMenu(site, text, "gnb__item", "gnb__link"),
    drawerMenu: renderMenu(site, text, "header__drawer-item", "header__drawer-link"),
  });
  const hero = render("partials/hero.html", {
    label: labels.hero,
    slides: site.hero.map((item) => render("partials/hero-slide.html", {
      ...item, ...text.hero[item.id],
    })).join(""),
    cards: site.hero.map((item, index) => render("partials/hero-card.html", {
      ...item, ...text.hero[item.id],
      activeClass: index === 0 ? " swiper-pagination-bullet-active" : "",
      current: index === 0 ? "true" : "false",
    })).join(""),
  });
  const newProducts = render("partials/new-products.html", {
    ...labels,
    description: text.newProductsDescription.map(escapeHtml).join("<br />"),
    cards: site.products.map((item) => render("partials/product-card.html", {
      ...item, name: text.products[item.id],
    })).join(""),
  });
  const categories = render("partials/categories.html", {
    categoryTitle: labels.categoryTitle,
    buttons: site.categories.map((item, index) => render("partials/category-button.html", {
      ...item, ...text.categories[item.id], selected: index === 0 ? "true" : "false",
    })).join(""),
    panels: site.categories.map((item, index) => render("partials/category-panel.html", {
      ...item, ...text.categories[item.id], hidden: index === 0 ? "" : "hidden",
    })).join(""),
  });
  const brands = render("partials/brands.html", {
    ...labels,
    options: site.brands.map((item, index) => render("partials/brand-option.html", {
      ...item, checked: index === 0 ? "checked" : "",
    })).join(""),
    panels: site.brands.map((item, index) => render("partials/brand-panel.html", {
      ...item, ...text.brands[item.id], viewAll: labels.viewAll,
      loading: index === 0 ? "" : 'loading="lazy"',
    })).join(""),
  });
  return render("page.html", {
    ...text, ...labels, language, header, hero, newProducts, categories, brands,
    storeLines: labels.storeLines.map(escapeHtml).join("<br />"),
    messageHeading: text.brandMessage.heading,
    messageDescription: text.brandMessage.description,
  });
}

export function buildHtml() {
  for (const [language, output] of [["ko", "html/index.html"], ["en", "html/en.html"]]) {
    writeFileSync(resolve(root, output), renderPage(language));
  }
}

// 테스트에서 import할 때는 생성된 HTML을 덮어쓰지 않는다.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) buildHtml();
