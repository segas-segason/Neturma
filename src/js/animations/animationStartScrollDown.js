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

	const dustLayer = document.getElementById("air");
	const aboutProjectSection = document.querySelector(
		"[data-about-project-panel]"
	);
	const onFreedomSection = document.querySelector("[data-on-freedom-panel]");

	const clipTargets = [hero, aboutProjectSection, onFreedomSection];
	let dustClipRaf = null;
	let lastDustClip = "";
	let isHeroVisible = true;
	let isAnimating = false;
	let tlDirection = 1;

	const updateDustClip = () => {
		dustClipRaf = null;
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

		const nextDustClip = parts.length
			? `path('${parts.join(" ")}')`
			: "inset(100%)";

		if (nextDustClip !== lastDustClip) {
			dustLayer.style.clipPath = nextDustClip;
			lastDustClip = nextDustClip;
		}
	};

	const scheduleDustClip = () => {
		if (dustClipRaf !== null) return;
		dustClipRaf = requestAnimationFrame(updateDustClip);
	};

	window.addEventListener("scroll", scheduleDustClip, { passive: true });
	window.addEventListener("resize", scheduleDustClip, { passive: true });
	gsap.ticker.add(() => {
		if (isAnimating) scheduleDustClip();
	});
	scheduleDustClip();

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
	const SIZE = isMobile ? 320 : 620;

	const belowViewport = () => ((window.innerHeight + SIZE) / SIZE) * 100;
	const aboveViewport = () => -((window.innerHeight + SIZE) / SIZE) * 100;

	gsap.set(balloonEls, {
		yPercent: belowViewport,
		scale: 0.5,
		rotation: (i) => balloons[i].rot,
		autoAlpha: 0,
		transformOrigin: "50% 80%",
	});

	const balloonTL = gsap.timeline({ paused: true });

	balloonTL.to(balloonEls, {
		keyframes: [
			{ autoAlpha: 1, duration: 0.15 },
			{
				yPercent: aboveViewport,
				xPercent: (i) => gsap.utils.random(-80, 80),
				duration: (i) => gsap.utils.random(3, 3.2),
				ease: "none",
			},
			{ autoAlpha: 0, duration: 0.3 },
		],
		scale: (i) => gsap.utils.random(0.2, 0.5),
		stagger: { each: (i) => gsap.utils.random(0.1, 0.25), from: "random" },
	});

	const resetBalloons = () => {
		balloonTL.pause(0);
		gsap.set(balloonEls, {
			yPercent: belowViewport,
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
			gsap.delayedCall(0.1, () => {
				if (tlDirection === 1) balloonTL.restart();
			});
		}
	};

	const navigate = async (targetId) => {
		if (!targetId) return;

		/* ===================== НА HERO ===================== */

		if (targetId === "#hero") {
			if (isHeroVisible && !isAnimating) {
				window.scrollTo(0, 0);
				return;
			}

			isAnimating = true;
			tlDirection = -1;

			gsap.to(window, {
				duration: 0.8,
				scrollTo: 0,
				ease: "power3.inOut",
				overwrite: true,
			});

			tl.reverse();

			// Ждём полного возвращения hero
			await tl.then();

			return;
		}

		/* ===================== ИЗ HERO В MAIN ===================== */

		if (isHeroVisible) {
			if (isAnimating && tlDirection === 1) {
				await tl.then();
				return;
			}

			isAnimating = true;
			tlDirection = 1;

			window.scrollTo(0, 0);

			/*
			 * Hero и шарики запускаются параллельно.
			 * Шарики больше не являются частью основного timeline.
			 */
			tl.play();

			gsap.delayedCall(0.1, () => {
				if (tlDirection === 1) {
					balloonTL.restart();
				}
			});

			/*
			 * Очень важно:
			 * ждём пока timeline покажет #main.
			 *
			 * Только после этого sidebar сможет вычислять
			 * правильную позицию нужной секции.
			 */
			await tl.then();
		}

		/* ===================== MAIN УЖЕ ОТКРЫТ ===================== */

		return;
	};

	if (heroBtnDown) {
		heroBtnDown.addEventListener("click", goDown);
	}

	window.addEventListener(
		"wheel",
		(e) => {
			if (isAnimating) {
				e.preventDefault();
				return;
			}

			if (e.deltaY > 0) {
				goDown();
			}
		},
		{ passive: false }
	);

	let touchStart = null;
	let consumeTouch = false;

	window.addEventListener(
		"touchstart",
		(e) => {
			consumeTouch = consumeTouch || isAnimating;
			touchStart = null;

			if (!isHeroVisible || isAnimating || e.touches.length !== 1) return;
			if (e.target.closest?.("#sidebar, #sidebar-toggle, [data-lenis-prevent]")) return;

			const touch = e.touches[0];
			touchStart = {
				id: touch.identifier,
				x: touch.clientX,
				y: touch.clientY,
			};
		},
		{ passive: true }
	);

	window.addEventListener(
		"touchmove",
		(e) => {
			if (isAnimating || consumeTouch) {
				consumeTouch = true;
				if (e.cancelable) e.preventDefault();
				return;
			}

			if (!isHeroVisible || !touchStart) return;
			if (e.touches.length !== 1) {
				touchStart = null;
				return;
			}

			const touch = Array.from(e.touches).find(
				(item) => item.identifier === touchStart.id
			);
			if (!touch) return;
			if (e.cancelable) e.preventDefault();

			const deltaX = touchStart.x - touch.clientX;
			const deltaY = touchStart.y - touch.clientY;

			if (deltaY > 40 && deltaY > Math.abs(deltaX) * 1.25) {
				consumeTouch = true;
				touchStart = null;
				goDown();
			}
		},
		{ passive: false }
	);

	const endTouch = (e) => {
		if (e.touches.length > 0) return;
		touchStart = null;
		consumeTouch = false;
	};

	window.addEventListener("touchend", endTouch, { passive: true });
	window.addEventListener("touchcancel", endTouch, { passive: true });

	return {
		balloonSystem,
		navigate,
	};
}
