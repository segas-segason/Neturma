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
    const container = sidebar.querySelector(".sidebar-nav__container");
    const headerInner = sidebar.querySelector(".sidebar-nav__header-inner");
    const list = sidebar.querySelector(".sidebar-nav__list");
    const texts = Array.from(sidebar.querySelectorAll(".sidebar-nav__text"));
    const numbers = Array.from(sidebar.querySelectorAll(".sidebar-nav__number"));

    // Футер
    const footer = sidebar.querySelector(".sidebar-nav__footer");

    const START = {
        top: { x1: 0, y1: 9, x2: 32, y2: 9 },
        bot: { x1: 0, y1: 23, x2: 32, y2: 23 }
    };

    // Крестик (две диагонали) строго по центру 16,16
    const END = {
        top: { x1: 6, y1: 6, x2: 26, y2: 26 },
        bot: { x1: 26, y1: 6, x2: 6, y2: 26 }
    };

    const tl = gsap.timeline({ paused: true, defaults: { ease: "sine.inOut" } });

    const WIDTH_FULL = "100vw";
    const WIDTH_AUTO = "auto";

    let animation = null;

    // Начальное состоятие сайдбара
    gsap.set(sidebar, {
        width: WIDTH_AUTO
    });

    gsap.set(logo, {
        display: "none",
        opacity: 0,
        overflow: "hidden"
    });

    gsap.set(headerInner, {
        justifyContent: "center"
    });

    gsap.set(list, {
        alignItems: "center"
    });

    gsap.set(texts, {
        opacity: 0,
        display: "none"
    });

    gsap.set(footer, {
        opacity: 0,
        display: "none"
    });

    tl.to(top, { attr: END.top, duration: 0.25 }, 0)
        .to(bot, { attr: END.bot, duration: 0.25 }, 0)
        .to(mid, { opacity: 0, duration: 0.05 }, 0);

    let open = false;

    btn.addEventListener("click", () => {
        if (tl.isActive()) return;

        if (!open) {
            //  Открытие
            open = true;
            btn.setAttribute("aria-expanded", "true");

            gsap.set(sidebar, {
                width: open ? WIDTH_FULL : WIDTH_AUTO
            });

            gsap.set(logo, {
                display: "block",
                opacity: 1
            });

            gsap.set(list, {
                alignItems: "baseline"
            });

            gsap.set(texts, {
                opacity: 1,
                display: "block"
            });

            gsap.set(footer, {
                opacity: 1,
                display: "flex",
                y: 0
            });

            tl.play();

        } else {
            //  Закрытие
            open = false;
            btn.setAttribute("aria-expanded", "false");

            gsap.set(sidebar, {
                width: WIDTH_AUTO
            });

            gsap.set(logo, {
                display: "none",
                opacity: 0,
                overflow: "hidden"
            });

            gsap.set(headerInner, {
                justifyContent: "center"
            });

            gsap.set(list, {
                alignItems: "center"
            });

            gsap.set(texts, {
                opacity: 0,
                display: "none"
            });

            gsap.set(footer, {
                opacity: 0,
                display: "none"
            });

            tl.reverse();
            gsap.to(mid, { opacity: 1, duration: 0.15, delay: 0.1 });
        }
    });
});