import { gsap } from "gsap";

document.addEventListener("DOMContentLoaded", () => {
    const sidebar = document.querySelector(".sidebar-nav");
    if (!sidebar) return;

    const btn = sidebar.querySelector(".sidebar-nav__toggle");

    // Иконка
    const top = btn.querySelector(".l--top");
    const mid = btn.querySelector(".l--mid");
    const bot = btn.querySelector(".l--bot");

    // Лого
    const logo = sidebar.querySelector(".sidebar-nav__logo");

    // Навигация
    const nav = sidebar.querySelector(".sidebar-nav__nav");
    const texts = Array.from(sidebar.querySelectorAll(".sidebar-nav__text"));
    const numbers = Array.from(sidebar.querySelectorAll(".sidebar-nav__number"));

    // Футер
    const footer = sidebar.querySelector(".sidebar-nav__footer");

    const START = {
        top: { x1: 0, y1: 9, x2: 32, y2: 9 },
        bot: { x1: 0, y1: 23, x2: 32, y2: 23 }
    };

    // крестик (две диагонали) строго по центру 16,16
    const END = {
        top: { x1: 6, y1: 6, x2: 26, y2: 26 }, // \
        bot: { x1: 26, y1: 6, x2: 6, y2: 26 }  // /
    };

    const tl = gsap.timeline({ paused: true, defaults: { ease: "power2.out" } });

    tl.to(top, { attr: END.top, duration: 0.25 }, 0)
        .to(bot, { attr: END.bot, duration: 0.25 }, 0)
        .to(mid, { opacity: 0, duration: 0.15 }, 0);

    let open = false;

    btn.addEventListener("click", () => {
        open = !open;
        btn.setAttribute("aria-expanded", String(open));

        if (open) {
            tl.play();
        } else {
            tl.reverse();
            gsap.to(mid, { opacity: 1, duration: 0.15, delay: 0.1 });
        }
    });

});