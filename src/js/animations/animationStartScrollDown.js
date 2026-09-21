import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { initBalloons } from "./animationBalloons.js";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

export function initAnimationStartScrollDown() {
	const hero = document.getElementById("hero");
	if (!hero) return;

	const heroYear = document.getElementById("hero-year");
	const heroCity = document.getElementById("hero-city");
	const heroSlogan = document.getElementById("hero-slogan");
	const heroLogo = document.getElementById("logo-head");
	const heroBtnDown = document.getElementById("hero-btn-down");
	const heroBtnDownIcon = document.getElementById("hero-btn-down-icon");
	const heroBtnDownLabel = document.getElementById("hero-btn-down-label");

	const fadeElements = [heroYear, heroSlogan].filter(Boolean);

	const main = document.getElementById("main");
	const footer = document.querySelector("footer");

	const dividerLine = document.querySelectorAll("#line-divider");

	const mainSections = gsap.utils.toArray("#main > section");
	const sidebarLinks = document.querySelectorAll("#sidebar-nav a[href^='#']");

	const dustLayer = document.getElementById("air");
	const aboutProjectSection = document.querySelector(
		"[data-about-project-panel]"
	);
	const onFreedomSection = document.querySelector("[data-on-freedom-panel]");

	const clipTargets = [hero, aboutProjectSection, onFreedomSection];

	const updateDustClip = () => {
		if (!dustLayer) return;

		const vw = window.innerWidth;
		const vh = window.innerHeight;
		const parts = [];

		clipTargets.forEach((el) => {
			if (!el) return;
			if (getComputedStyle(el).display === "none") return;

			const r = el.getBoundingClientRect();
			const top = Math.max(0, r.top);
			const bottom = Math.min(vh, r.bottom);
			const left = Math.max(0, r.left);
			const right = Math.min(vw, r.right);

			if (bottom > top && right > left) {
				parts.push(
					`M${left},${top}L${right},${top}L${right},${bottom}L${left},${bottom}Z`
				);
			}
		});

		dustLayer.style.clipPath = parts.length
			? `path('${parts.join(" ")}')`
			: "inset(100%)";
	};

	gsap.ticker.add(updateDustClip);

	let isHeroVisible = true;
	let isAnimating = false;
	let tlDirection = 1;

	window.scrollTo(0, 0);

	gsap.set(dustLayer, { autoAlpha: 1, yPercent: 0 });
	gsap.set(mainSections, { autoAlpha: 0, y: 80 });
	gsap.set(dividerLine, {
		scaleX: 0,
		opacity: 0,
		transformOrigin: "left center",
	});
	gsap.set(heroBtnDownIcon, { scale: 0.66 });
	gsap.set(footer, { autoAlpha: 0, y: 80 });
	gsap.set([main, footer], { display: "none" });

	document.body.style.overflow = "hidden";
	document.documentElement.style.overflow = "hidden";

	/* ========== ШАРИКИ (оверлей поверх перехода) ========== */

	const balloonSystem = initBalloons(12);
	const { balloons, elements: balloonEls } = balloonSystem;

	const isMobile = window.matchMedia("(max-width: 1023px)").matches;
	const Y_START = isMobile ? 260 : 220;
	const Y_END = isMobile ? -420 : -280;

	gsap.set(balloonEls, {
		yPercent: 220,
		scale: 0,
		rotation: (i) => balloons[i].rot,
		autoAlpha: 0,
		transformOrigin: "50% 80%",
	});

	const balloonTL = gsap.timeline({ paused: true });

	balloonTL.to(balloonEls, {
		keyframes: [
			{ autoAlpha: 1, duration: 0.3 },
			{
				yPercent: Y_END,
				xPercent: (i) => gsap.utils.random(-80, 80),
				rotation: (i) => balloons[i].rot + gsap.utils.random(-15, 15),
				duration: (i) => gsap.utils.random(2.0, 2.8),
				ease: "none",
			},
			{ autoAlpha: 0, duration: 0.3 },
		],
		scale: (i) => balloons[i].scaleTo,
		stagger: {
			each: (i) => gsap.utils.random(0.05, 0.2),
			from: "random",
		},
	});

	const resetBalloons = () => {
		balloonTL.pause(0);
		gsap.set(balloonEls, {
			yPercent: Y_START,
			scale: 0,
			autoAlpha: 0,
		});
	};

	/* ========== ТАЙМЛАЙН ========== */

	const tl = gsap.timeline({
		paused: true,
		reversed: true,

		onStart: () => {
			isAnimating = true;
		},

		onComplete: () => {
			isAnimating = false;
			isHeroVisible = false;

			document.body.style.overflow = "";
			document.documentElement.style.overflow = "";

			gsap.set(mainSections, { clearProps: "transform" });

			ScrollTrigger.refresh();
		},

		onReverseComplete: () => {
			isAnimating = false;
			isHeroVisible = true;

			resetBalloons();

			document.body.style.overflow = "hidden";
			document.documentElement.style.overflow = "hidden";

			window.dispatchEvent(new CustomEvent("app:hero-mode"));
		},
	});

	tl.to(fadeElements, {
		yPercent: -120,
		duration: 0.6,
		stagger: 0.05,
		ease: "power2.inOut",
	})
		.to(
			heroCity,
			{
				yPercent: 120,
				duration: 0.6,
				ease: "power2.inOut",
			},
			"<"
		)
		.to(
			heroLogo,
			{
				y: () => {
					const rect = heroLogo.getBoundingClientRect();
					return -rect.top - rect.height;
				},
				autoAlpha: 0,
				duration: 1.2,
				ease: "power3.inOut",
				scale: 0.5,
			},
			"-=0.3"
		)
		.to(
			dustLayer,
			{
				autoAlpha: 0,
				duration: 0.5,
				ease: "power3.inOut",
			},
			"-=1"
		)
		.to(
			dustLayer,
			{
				yPercent: -100,
				scale: 0,
				duration: 1.2,
				ease: "power3.inOut",
			},
			"-=1.2"
		)
		.to(heroBtnDownLabel, { autoAlpha: 0 }, "-=1.5")
		.to(
			heroBtnDown,
			{
				y: () => {
					const rect = heroBtnDown.getBoundingClientRect();
					const windowCenterY = window.innerHeight / 2;
					const btnCenterY = rect.top + rect.height / 2;
					return windowCenterY - btnCenterY;
				},
				duration: 1.2,
				ease: "power3.inOut",
			},
			"-=1.2"
		)
		.to(
			heroBtnDownIcon,
			{
				scale: 1,
				duration: 1.2,
				ease: "power3.inOut",
				pointerEvents: "none",
				fill: "#000",
			},
			"-=1.2"
		)
		.to(heroBtnDown, {
			autoAlpha: 0,
			scale: 0,
			duration: 0.5,
			ease: "power2.in",
		})

		/* ---- Запуск шариков поверх. Они летят параллельно main. ---- */
		.call(
			() => {
				if (tlDirection === 1) {
					balloonTL.restart();
				}
			},
			null,
			"-=2"
		)

		/* ---- main/footer появляются СРАЗУ, не ждут шариков. ---- */
		.set(hero, { display: "none" })
		.set(dustLayer, { autoAlpha: 0, yPercent: 0, scale: 1 })
		.set([main, footer], { display: "" })
		.to([...mainSections, footer], {
			autoAlpha: 1,
			y: 0,
			duration: 0.8,
			stagger: 0.1,
			ease: "power3.out",
		})
		.to(
			dividerLine,
			{
				opacity: 1,
				scaleX: 1,
				duration: 0.3,
				stagger: 0.08,
				ease: "power2.out",
			},
			"<"
		)
		.to(
			dustLayer,
			{
				autoAlpha: 1,
				yPercent: 0,
				duration: 1.2,
				ease: "power2.out",
			},
			"<"
		);

	const goDown = () => {
		if (isHeroVisible && !isAnimating) {
			isAnimating = true;
			tlDirection = 1;
			window.scrollTo(0, 0);
			tl.play();
		}
	};

	if (heroBtnDown) {
		heroBtnDown.addEventListener("click", goDown);
	}

	sidebarLinks.forEach((link) => {
		link.addEventListener("click", (e) => {
			e.preventDefault();

			const targetId = link.getAttribute("href");
			if (!targetId) return;

			if (targetId === "#hero") {
				if (isHeroVisible && !isAnimating) return;

				isAnimating = true;
				tlDirection = -1;
				tl.reverse();

				gsap.to(window, {
					duration: 1.2,
					scrollTo: 0,
					ease: "power3.inOut",
					overwrite: true,
				});

				return;
			}

			if (isHeroVisible) {
				isAnimating = true;
				tlDirection = 1;

				window.scrollTo(0, 0);

				tl.play();

				gsap.to(window, {
					duration: 1.2,
					scrollTo: targetId,
					ease: "power3.inOut",
					overwrite: true,
				});

				return;
			}

			gsap.to(window, {
				duration: 1,
				scrollTo: targetId,
				ease: "power3.inOut",
				overwrite: true,
			});
		});
	});

	window.addEventListener(
		"wheel",
		(e) => {
			if (isAnimating) {
				e.preventDefault();
				if (isHeroVisible) {
					window.scrollTo(0, 0);
				}
				return;
			}

			if (e.deltaY > 0) {
				goDown();
			}
		},
		{ passive: false }
	);

	let touchStartY = 0;

	window.addEventListener(
		"touchstart",
		(e) => {
			touchStartY = e.touches[0].clientY;
		},
		{ passive: true }
	);

	window.addEventListener(
		"touchmove",
		(e) => {
			if (isAnimating) {
				e.preventDefault();
				if (isHeroVisible) {
					window.scrollTo(0, 0);
				}
				return;
			}

			const touchEndY = e.touches[0].clientY;
			const deltaY = touchStartY - touchEndY;

			if (deltaY > 30) {
				goDown();
			}
		},
		{ passive: false }
	);

	return balloonSystem;
}
