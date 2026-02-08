const yearElement = document.getElementById("year");
if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

const root = document.documentElement;
const langToggles = document.querySelectorAll(".lang-toggle");
const storedLang = localStorage.getItem("preferredLang");

function applyLang(lang) {
  root.setAttribute("data-lang", lang);
  root.setAttribute("lang", lang);
  const nextAria = lang === "tr" ? "Switch language to English" : "Switch language to Turkish";
  langToggles.forEach((toggle) => {
    toggle.setAttribute("aria-label", nextAria);
    toggle.setAttribute("aria-pressed", lang === "en" ? "true" : "false");
  });
}

if (storedLang === "tr" || storedLang === "en") {
  applyLang(storedLang);
} else {
  applyLang(root.getAttribute("data-lang") || "tr");
}

langToggles.forEach((toggle) => {
  toggle.addEventListener("click", () => {
    const current = root.getAttribute("data-lang") || "tr";
    const next = current === "tr" ? "en" : "tr";
    applyLang(next);
    localStorage.setItem("preferredLang", next);
  });
});

const menuToggle = document.getElementById("menu-toggle");
const mobileMenu = document.getElementById("mobile-menu");

if (menuToggle && mobileMenu) {
  let isOpen = false;

  const setMenuState = (open) => {
    isOpen = open;
    menuToggle.classList.toggle("is-open", open);
    mobileMenu.classList.toggle("is-open", open);
    menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.classList.toggle("menu-open", open);
  };

  menuToggle.addEventListener("click", (event) => {
    event.preventDefault();
    setMenuState(!isOpen);
  });

  document.addEventListener("click", (event) => {
    if (!isOpen) {
      return;
    }
    if (mobileMenu.contains(event.target) || menuToggle.contains(event.target)) {
      return;
    }
    setMenuState(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isOpen) {
      setMenuState(false);
    }
  });

  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenuState(false));
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 980 && isOpen) {
      setMenuState(false);
    }
  });
}
