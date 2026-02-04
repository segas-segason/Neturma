import { gsap } from "gsap";

export function initPreloader() {
    const preloader = document.getElementById("preloader");
    if (!preloader) return;

    const content = preloader.querySelector(".preloader__content");
    const fill = preloader.querySelector(".preloader__bar-fill");
    if (!content || !fill) return;

    // старт
    preloader.classList.remove("is-hidden");
    preloader.style.display = "grid";
    gsap.set(preloader, { opacity: 1, visibility: "visible" });
    gsap.set(content, { opacity: 1, y: 0, force3D: true });
    gsap.set(fill, { width: "0%" });

    let fake = 0;
    let done = false;

    const fakeTimer = setInterval(() => {
        if (done) return;
        fake = Math.min(90, fake + Math.max(0.4, (90 - fake) * 0.06));
        gsap.set(fill, { width: `${fake}%` });
    }, 120);

    const finish = () => {
        if (done) return;
        done = true;
        clearInterval(fakeTimer);

        gsap.to(fill, {
            width: "100%",
            duration: 0.35,
            ease: "power2.out",
            onComplete: () => {
                // таймлайн закрытия: бар+лого вниз + плавное исчезновение
                gsap.timeline()
                    .to(content, {
                        y: 24,
                        opacity: 0,
                        duration: 0.45,
                        ease: "power2.inOut",
                    }, 0.15)
                    .to(preloader, {
                        opacity: 0,
                        duration: 0.45,
                        ease: "power2.inOut",
                    }, 0.18)
                    .add(() => {
                        preloader.classList.add("is-hidden");
                        preloader.style.display = "none";
                        gsap.set(preloader, { visibility: "hidden" });
                    });
            },
        });
    };

    window.addEventListener("load", () => {
        gsap.delayedCall(0.05, finish);
    });

    setTimeout(() => {
        if (!done) finish();
    }, 12000);
}