// change Theme

document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;
  const btn = document.querySelector(".hero__theme");
  if (!btn) return;

  const STORAGE_KEY = "theme";

  function setTheme(theme) {
    root.dataset.theme = theme;
    localStorage.setItem(STORAGE_KEY, theme);
  }

  function getTheme() {
    return (
      localStorage.getItem(STORAGE_KEY) ||
      (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    );
  }

  setTheme(getTheme());

  btn.addEventListener("click", () => {
    const current = root.dataset.theme || "dark";
    const next = current === "dark" ? "light" : "dark";
    setTheme(next);
    console.log("theme:", next);
  });
});

// PopUp

const popup = document.getElementById("popup");
const openBtn = document.querySelector(".open-popup");
const closeBtn = popup.querySelector(".popup__close");

function openPopup() {
  popup.classList.add("active");
  document.body.classList.add("no-scroll");
}

function closePopup() {
  popup.classList.remove("active");
  document.body.classList.remove("no-scroll");
}

openBtn.addEventListener("click", openPopup);
closeBtn.addEventListener("click", closePopup);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closePopup();
});

//open and close Menu

document.addEventListener("DOMContentLoaded", () => {
  const rows = document.querySelectorAll(".menu-row");
  const panels = document.querySelectorAll(".menu-panel");
  if (!rows.length || !panels.length) return;

  let isAnimating = false;
  let scrollTimeout;

  function open(panel) {
    panel.hidden = false;

    panel.style.height = "0px";
    panel.offsetHeight;

    panel.classList.add("is-open");

    panel.style.height = panel.scrollHeight + "px";

    const onEnd = (e) => {
      if (e.propertyName !== "height") return;
      panel.style.height = "auto";
      panel.removeEventListener("transitionend", onEnd);
    };

    panel.addEventListener("transitionend", onEnd);
  }

  function close(panel) {
    panel.style.height = panel.scrollHeight + "px";
    panel.offsetHeight;

    panel.style.height = "0px";
    panel.classList.remove("is-open");

    const onEnd = (e) => {
      if (e.propertyName !== "height") return;
      panel.hidden = true;
      panel.removeEventListener("transitionend", onEnd);
    };

    panel.addEventListener("transitionend", onEnd);
  }

  function closeAll(exceptKey = null) {
    panels.forEach((p) => {
      const key = p.dataset.panel;
      if (key === exceptKey) return;
      if (!p.hidden) close(p);
    });

    rows.forEach((r) => {
      const isActive = r.dataset.target === exceptKey;
      r.setAttribute("aria-expanded", isActive ? "true" : "false");
      r.classList.toggle("is-open", isActive);
    });
  }

  function smoothScrollTo(element, offset = 0) {
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
  }

  function toggle(key) {
    if (isAnimating) return;
    isAnimating = true;

    const row = document.querySelector(`.menu-row[data-target="${key}"]`);
    const panel = document.querySelector(`.menu-panel[data-panel="${key}"]`);
    if (!row || !panel) {
      isAnimating = false;
      return;
    }

    // Если панель уже открыта - просто закрываем
    if (!panel.hidden) {
      row.setAttribute("aria-expanded", "false");
      row.classList.remove("is-open");
      close(panel);
      isAnimating = false;
      return;
    }

    // Сохраняем текущую позицию скролла
    const scrollBefore = window.pageYOffset;

    // Закрываем все другие панели
    closeAll(key);

    // Открываем текущую панель
    open(panel);

    // Используем Intersection Observer для определения когда элемент стабилен
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Когда элемент видим, скроллим к нему
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
              smoothScrollTo(row, 16);
            }, 50);

            observer.disconnect();

            // Снимаем блокировку после небольшой задержки
            setTimeout(() => {
              isAnimating = false;
            }, 350);
          }
        });
      },
      {
        threshold: 0.1,
      }
    );

    // Начинаем наблюдать за кнопкой
    observer.observe(row);

    // Fallback: если через 500ms элемент все еще не видим
    setTimeout(() => {
      observer.disconnect();
      smoothScrollTo(row, 16);
      setTimeout(() => {
        isAnimating = false;
      }, 300);
    }, 500);
  }

  rows.forEach((row) => {
    row.addEventListener("click", (e) => {
      e.preventDefault();
      toggle(row.dataset.target);
    });
  });
});

//Locomotive Scroll
(function () {
  var scroll = new LocomotiveScroll();
})();
