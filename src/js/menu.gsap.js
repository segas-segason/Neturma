import { gsap } from "gsap";

document.addEventListener("DOMContentLoaded", () => {
    const items = Array.from(document.querySelectorAll(".menu-item"));
    if (!items.length) return;

    const OFFSET_Y = 16; // если появится фикс-хедер — сюда его высоту
    const OPEN_DUR = 0.6;
    const CLOSE_DUR = 0.45;

    const get = (item) => ({
        trigger: item.querySelector(".menu-item__trigger"),
        panel: item.querySelector(".menu-item__panel"),
    });

    // init
    items.forEach((item) => {
        const { trigger, panel } = get(item);
        if (!trigger || !panel) return;

        panel.hidden = true;
        trigger.setAttribute("aria-expanded", "false");
        item.classList.remove("is-open");

        gsap.set(panel, { height: 0, overflow: "hidden" });
    });

    const closeItem = (item) => {
        const { trigger, panel } = get(item);
        if (!trigger || !panel || panel.hidden) return;

        item.classList.remove("is-open");
        trigger.setAttribute("aria-expanded", "false");

        gsap.killTweensOf(panel);
        gsap.set(panel, { height: panel.offsetHeight });

        gsap.to(panel, {
            height: 0,
            duration: CLOSE_DUR,
            ease: "power2.inOut",
            onComplete: () => {
                panel.hidden = true;
            },
        });
    };

    const openItem = (item) => {
        const { trigger, panel } = get(item);
        if (!trigger || !panel) return;

        item.classList.add("is-open");
        trigger.setAttribute("aria-expanded", "true");

        panel.hidden = false;
        gsap.killTweensOf(panel);
        gsap.set(panel, { height: 0, overflow: "hidden" });

        gsap.to(panel, {
            height: panel.scrollHeight,
            duration: OPEN_DUR,
            ease: "power2.out",
            onComplete: () => {
                gsap.set(panel, { height: "auto" });
            },
        });

        // скролл к верху блока
        gsap.delayedCall(0.05, () => {
            const rect = item.getBoundingClientRect();
            const y = window.scrollY + rect.top - OFFSET_Y;

            gsap.to(document.scrollingElement || document.documentElement, {
                scrollTop: y,
                duration: 0.6,
                ease: "power2.out",
            });
        });
    };

    items.forEach((item) => {
        const { trigger } = get(item);
        if (!trigger) return;

        trigger.addEventListener("click", (e) => {
            e.preventDefault();

            const isOpen = item.classList.contains("is-open");

            // закрываем остальные
            items.forEach((it) => {
                if (it !== item) closeItem(it);
            });

            if (isOpen) {
                closeItem(item);
            } else {
                openItem(item);
            }
        });

        // клавиатура (ты правильно сделал tabindex)
        trigger.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                trigger.click();
            }
        });
    });
});
