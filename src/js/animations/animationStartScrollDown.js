import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

export function initAnimationStartScrollDown() {
	const hero = document.getElementById("hero");
	if (!hero) return;

	const heroYear = document.getElementById("hero-year");
	const heroCity = document.getElementById("hero-city");
	const heroSlogan = document.getElementById("hero-slogan");
	const heroCtaAddress = document.querySelector("#hero .grid");
	const heroLogo = document.getElementById("hero-logo");
	const heroBtnDown = document.getElementById("hero-btn-down");

	const fadeElements = [heroYear, heroCity, heroSlogan, heroCtaAddress];

	const dividerWrapper = hero.nextElementSibling;
	const dividerLine = dividerWrapper.querySelector(".bg-primary");
	const main = document.getElementById("main");
	const footer = document.querySelector("footer");
	const dust = document.querySelector("#air");
	const mainSections = gsap.utils.toArray("#main > section");
	const sidebarLinks = document.querySelectorAll("#sidebar-nav a[href^='#']");

	let isHeroVisible = true;
	let isAnimating = false;

	window.scrollTo(0, 0);

	gsap.set(mainSections, { autoAlpha: 0, y: 80 });
	gsap.set(footer, { autoAlpha: 0, y: 50 });
	gsap.set(dividerLine, { scaleX: 0, transformOrigin: "left center" });
	gsap.set([dividerWrapper, main, footer], { display: "none" });

	document.body.style.overflow = "hidden";
	document.documentElement.style.overflow = "hidden";

	const tl = gsap.timeline({
		paused: true,
		onStart: () => {
			isAnimating = true;
		},
		onComplete: () => {
			isAnimating = false;
			isHeroVisible = false;

			gsap.set(mainSections, {
				clearProps: "transform",
			});

			gsap.set(footer, {
				clearProps: "transform",
			});

			gsap.set(dust, {
				autoAlpha: 1,
			});

			document.body.style.overflow = "";
			document.documentElement.style.overflow = "";

			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					ScrollTrigger.refresh();
					ScrollTrigger.update();
				});
			});
		},
		onReverseComplete: () => {
			isAnimating = false;
			isHeroVisible = true;

			document.body.style.overflow = "hidden";
			document.documentElement.style.overflow = "hidden";

			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					ScrollTrigger.refresh();
					ScrollTrigger.update();
				});
			});
		},
	});

	tl.to(fadeElements, {
		autoAlpha: 0,
		y: -20,
		duration: 0.6,
		stagger: 0.05,
		ease: "power2.inOut",
	})
		.to(dust, {
			autoAlpha: 0,
			duration: 0.5,
			ease: "power2.in",
		})
		.to(
			heroLogo,
			{
				y: () =>
					-heroLogo.getBoundingClientRect().top -
					heroLogo.getBoundingClientRect().height,
				autoAlpha: 0,
				duration: 0.8,
				ease: "power3.inOut",
			},
			"+=0.1"
		)
		.to(
			heroBtnDown,
			{
				y: () => {
					const rect = heroBtnDown.getBoundingClientRect();
					const windowCenterY = window.innerHeight / 2;
					const btnCenterY = rect.top + rect.height / 2;
					return windowCenterY - btnCenterY;
				},
				scale: 1.5,
				duration: 0.8,
				ease: "power3.inOut",
			},
			"<"
		)
		.to(heroBtnDown, {
			autoAlpha: 0,
			scale: 0.5,
			duration: 0.4,
			ease: "power2.in",
		})
		.set(hero, { display: "none" })
		.set([dividerWrapper, main, footer], { display: "" })
		.to(dividerLine, {
			scaleX: 1,
			duration: 0.8,
			ease: "power4.out",
		})
		.to(
			mainSections,
			{
				autoAlpha: 1,
				y: 0,
				duration: 0.8,
				stagger: 0.15,
				ease: "power3.out",
			},
			"<0.2"
		)
		.to(
			footer,
			{
				autoAlpha: 1,
				y: 0,
				duration: 0.8,
				ease: "power3.out",
			},
			"-=0.5"
		);

	// --- ТРИГГЕРЫ УПРАВЛЕНИЯ ---
	const goDown = () => {
		if (isHeroVisible && !isAnimating) {
			isAnimating = true;

			window.scrollTo(0, 0);

			tl.play();
		}
	};

	if (heroBtnDown) {
		heroBtnDown.addEventListener("click", goDown);
	}

	// --- ОБРАБОТЧИК САЙДБАРА ---
	sidebarLinks.forEach((link) => {
		link.addEventListener("click", (e) => {
			e.preventDefault();
			const targetId = link.getAttribute("href");

			if (targetId === "#hero" && isHeroVisible) return;

			// 1. Клик по "Главная" (#hero) из Main
			if (targetId === "#hero" && !isHeroVisible && !isAnimating) {
				isAnimating = true;
				if (!isHeroVisible)
					gsap.set(dust, {
						autoAlpha: 0,
					});

				tl.reverse();

				gsap.to(window, {
					duration: 1.5,
					scrollTo: 0,
					ease: "power3.inOut",
				});
				return;
			}

			// 2. Если мы в Hero и кликнули на другие секции
			if (isHeroVisible) {
				isAnimating = true;
				window.scrollTo(0, 0);
				tl.play();

				// В GSAP timeline нет .then(), используем setTimeout
				setTimeout(() => {
					gsap.to(window, {
						duration: 1,
						scrollTo: targetId,
						ease: "power3.inOut",
					});
				}, tl.duration() * 1000);
			}
			// 3. Если мы в Main и кликнули на другие секции
			else {
				gsap.to(window, {
					duration: 1,
					scrollTo: targetId,
					ease: "power3.inOut",
				});
			}
		});
	});

	// --- КОЛЕСИКО МЫШИ ---
	window.addEventListener(
		"wheel",
		(e) => {
			if (isAnimating) {
				e.preventDefault();
				// Принудительно удерживаем вверху, чтобы побороть инерцию тачпада
				if (isHeroVisible) window.scrollTo(0, 0);
				return;
			}
			if (e.deltaY > 0) goDown();
		},
		{ passive: false }
	);

	// --- ТАЧСКРИН ---
	let touchStartY = 0;
	window.addEventListener(
		"touchstart",
		(e) => (touchStartY = e.touches[0].clientY),
		{ passive: true }
	);

	window.addEventListener(
		"touchmove",
		(e) => {
			if (isAnimating) {
				e.preventDefault();
				// Принудительно удерживаем вверху, чтобы побороть инерцию на мобильных
				if (isHeroVisible) window.scrollTo(0, 0);
				return;
			}
			let touchEndY = e.touches[0].clientY;
			let deltaY = touchStartY - touchEndY;
			if (deltaY > 30) goDown();
		},
		{ passive: false }
	);
}
