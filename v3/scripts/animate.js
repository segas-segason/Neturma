document.addEventListener("DOMContentLoaded", () => {
  const base = 0;
  const step = 0.8;

  [...document.querySelectorAll(".hero__word-inner")]
    .sort((a, b) => (+a.dataset.stagger || 0) - (+b.dataset.stagger || 0))
    .forEach((el, i) => {
      el.style.animationDelay = `${base + i * step}s`;
      el.classList.add("animate-word");
    });
});
