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
  });
});

// PopUp
(() => {
  const popup = document.getElementById("popup");
  const openBtn = document.querySelector(".open-popup");
  if (!popup || !openBtn) return;

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
  closeBtn?.addEventListener("click", closePopup);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closePopup();
  });
})();

document.addEventListener("DOMContentLoaded", () => {
  const items = Array.from(document.querySelectorAll(".menu-item"));
  if (!items.length) return;

  const prefersReduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const HEADER_OFFSET = 0; // если фикс-хедер 72 -> 72
  const FALLBACK_CLOSE_MS = 650;
  const FALLBACK_OPEN_MS = 650;

  const get = (item) => ({
    trigger: item.querySelector(".menu-item__trigger"),
    panel: item.querySelector(".menu-item__panel"),
  });

  const isOpen = (item) => {
    const { panel } = get(item);
    return panel && !panel.hidden && item.classList.contains("is-open");
  };

  const closeItem = (item) =>
    new Promise((resolve) => {
      const { trigger, panel } = get(item);
      if (!trigger || !panel) return resolve();

      if (panel.hidden) {
        item.classList.remove("is-open");
        trigger.setAttribute("aria-expanded", "false");
        panel.style.height = "0px";
        return resolve();
      }

      item.classList.remove("is-open");
      trigger.setAttribute("aria-expanded", "false");

      panel.style.height = `${panel.scrollHeight}px`;
      panel.offsetHeight;

      const done = () => {
        panel.hidden = true;
        panel.style.height = "0px";
        panel.removeEventListener("transitionend", onEnd);
        resolve();
      };

      const onEnd = (e) => {
        if (e.propertyName !== "height") return;
        done();
      };

      panel.addEventListener("transitionend", onEnd);
      panel.style.height = "0px";
      setTimeout(done, FALLBACK_CLOSE_MS);
    });

  const openItem = (item) =>
    new Promise((resolve) => {
      const { trigger, panel } = get(item);
      if (!trigger || !panel) return resolve();

      panel.hidden = false;
      panel.style.height = "0px";
      panel.offsetHeight;

      item.classList.add("is-open");
      trigger.setAttribute("aria-expanded", "true");

      const done = () => {
        panel.style.height = "auto";
        panel.removeEventListener("transitionend", onEnd);
        resolve();
      };

      const onEnd = (e) => {
        if (e.propertyName !== "height") return;
        done();
      };

      panel.addEventListener("transitionend", onEnd);
      panel.style.height = `${panel.scrollHeight}px`;
      setTimeout(done, FALLBACK_OPEN_MS);
    });

  const scrollClampToItemTop = (item) =>
    new Promise((resolve) => {
      const rect = item.getBoundingClientRect();
      const target = window.scrollY + rect.top - HEADER_OFFSET;

      const maxScroll =
        (document.scrollingElement || document.documentElement).scrollHeight - window.innerHeight;

      const clamped = Math.max(0, Math.min(target, Math.max(0, maxScroll)));

      if (prefersReduced || Math.abs(clamped - window.scrollY) < 1) {
        window.scrollTo(0, clamped);
        return resolve();
      }

      window.scrollTo({ top: clamped, behavior: "smooth" });

      const start = performance.now();
      const tick = () => {
        const now = performance.now();
        const atEnd = Math.abs(window.scrollY - clamped) < 2;
        if (atEnd || now - start > 800) return resolve();
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });

  // init closed
  items.forEach((item) => {
    const { trigger, panel } = get(item);
    if (!trigger || !panel) return;
    item.classList.remove("is-open");
    trigger.setAttribute("aria-expanded", "false");
    panel.hidden = true;
    panel.style.height = "0px";
  });

  let lock = false;

  const toggle = async (item) => {
    if (lock) return;
    lock = true;

    const already = isOpen(item);

    // close others
    const toClose = items.filter((it) => it !== item && isOpen(it));
    if (toClose.length) await Promise.all(toClose.map(closeItem));

    if (already) {
      await closeItem(item);
      lock = false;
      return;
    }

    await scrollClampToItemTop(item);
    await openItem(item);

    lock = false;
  };

  items.forEach((item) => {
    const { trigger } = get(item);
    if (!trigger) return;

    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      toggle(item);
    });

    trigger.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggle(item);
      }
    });
  });
});
