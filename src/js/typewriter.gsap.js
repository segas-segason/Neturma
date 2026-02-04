import { gsap } from "gsap";

function onReady(fn) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fn, { once: true });
  } else {
    fn();
  }
}

function splitToChars(el) {
  const text = el.textContent ?? "";
  el.textContent = "";

  const frag = document.createDocumentFragment();
  const chars = [];

  for (const ch of text) {
    const span = document.createElement("span");
    span.className = "fx-char";
    span.textContent = ch;
    frag.appendChild(span);
    chars.push(span);
  }

  el.appendChild(frag);
  return chars;
}

function makeCaret(afterEl) {
  const caret = document.createElement("span");
  caret.className = "fx-caret";
  caret.setAttribute("aria-hidden", "true");
  afterEl.insertAdjacentElement("afterend", caret);
  return caret;
}

export function initHeroTypewriter({
  rootSelector = ".hero",
  citySelector = ".hero__city",
  wordsSelector = ".hero__word-inner",
  startDelay = 0.15,
  baseCharDelay = 0.03,      // базовая скорость
  jitter = 0.018,            // “человечность” скорости
  punchDur = 0.08,           // удар по букве
  caretBlink = 0.5,
} = {}) {
  onReady(() => {
    const root = document.querySelector(rootSelector);
    if (!root) return;

    const cityEl = root.querySelector(citySelector);
    const wordEls = Array.from(root.querySelectorAll(wordsSelector));
    if (!cityEl || !wordEls.length) return;

    const prefersReduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Подготовка: разбиваем на символы
    const cityChars = splitToChars(cityEl);
    const wordsChars = wordEls.map(splitToChars);

    // Скрываем заранее
    gsap.set([cityChars, ...wordsChars].flat(), { opacity: 0, y: "-0.08em" });

    // Каретка (сначала после city)
    let caret = makeCaret(cityEl);

    // Мигающая каретка
    const blink = gsap.to(caret, {
      opacity: 0,
      duration: caretBlink,
      ease: "power1.inOut",
      repeat: -1,
      yoyo: true,
    });

    const typeChars = (chars, hostEl) =>
      new Promise((resolve) => {
        if (!chars.length) return resolve();

        // переставляем каретку после текущего хоста
        caret.remove();
        caret = makeCaret(hostEl);
        blink.targets([caret]);

        let i = 0;

        const tick = () => {
          const ch = chars[i];

          // появление + лёгкий “удар”
          gsap.to(ch, {
            opacity: 1,
            y: 0,
            duration: prefersReduced ? 0 : punchDur,
            ease: "power2.out",
          });

          // небольшая микровибрация каретки на “ударе”
          gsap.fromTo(
            caret,
            { x: 0 },
            {
              x: prefersReduced ? 0 : gsap.utils.random(-1, 1),
              duration: prefersReduced ? 0 : 0.06,
              ease: "power1.out",
              clearProps: "x",
            }
          );

          i += 1;
          if (i >= chars.length) {
            // маленькая пауза после слова
            gsap.delayedCall(prefersReduced ? 0 : 0.18, resolve);
            return;
          }

          // “человечная” задержка между символами
          const d = prefersReduced
            ? 0
            : Math.max(0.01, baseCharDelay + gsap.utils.random(-jitter, jitter));

          gsap.delayedCall(d, tick);
        };

        tick();
      });

    (async () => {
      // стартовая пауза
      if (!prefersReduced) await new Promise((r) => setTimeout(r, startDelay * 1000));

      // 1) Арт-город
      await typeChars(cityChars, cityEl);

      // 2) Слоган по словам
      for (let idx = 0; idx < wordsChars.length; idx += 1) {
        await typeChars(wordsChars[idx], wordEls[idx]);
      }

      // финал: каретка ещё чуть мигает и исчезает
      gsap.delayedCall(prefersReduced ? 0 : 0.35, () => {
        blink.kill();
        gsap.to(caret, { opacity: 0, duration: 0.25, ease: "power1.out" });
      });
    })();
  });
}
