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

const popup = document.getElementById('popup');
const openBtn = document.querySelector('.open-popup');
const closeBtn = popup.querySelector('.popup__close');

function openPopup() {
  popup.classList.add('active');
  document.body.classList.add('no-scroll');
}

function closePopup() {
  popup.classList.remove('active');
  document.body.classList.remove('no-scroll');
}

openBtn.addEventListener('click', openPopup);
closeBtn.addEventListener('click', closePopup);

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closePopup();
});

//open and close Menu

document.addEventListener("DOMContentLoaded", () => {
  const rows = document.querySelectorAll(".menu-row");
  const panels = document.querySelectorAll(".menu-panel");
  if (!rows.length || !panels.length) return;

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

  function toggle(key) {
    const row = document.querySelector(`.menu-row[data-target="${key}"]`);
    const panel = document.querySelector(`.menu-panel[data-panel="${key}"]`);
    if (!row || !panel) return;

    if (!panel.hidden) {
      row.setAttribute("aria-expanded", "false");
      row.classList.remove("is-open");
      close(panel);
      return;
    }

    closeAll(key);
    open(panel);

    row.focus({ preventScroll: true });
    const y = row.getBoundingClientRect().top + window.pageYOffset - 16;
    window.scrollTo({ top: y, behavior: "smooth" });
  }

  rows.forEach((row) => {
    row.addEventListener("click", () => toggle(row.dataset.target));
  });
});
