import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

ScrollTrigger.config({
	limitCallbacks: true,
	ignoreMobileResize: true,
});

let lenisInstance = null;

export function initAnimationsSmoothScroll() {
	const lenis = new Lenis({
		easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
		autoResize: false,
		virtualScroll: ({ event }) => !event.defaultPrevented,
	});

	lenis.on("scroll", ScrollTrigger.update);

	gsap.ticker.add((time) => lenis.raf(time * 1000));
	gsap.ticker.lagSmoothing(0);

	let resizeFrame = null;
	const resizeObserver = new ResizeObserver(() => {
		if (resizeFrame !== null) return;

		resizeFrame = requestAnimationFrame(() => {
			resizeFrame = null;
			lenis.dimensions.resize();
		});
	});
	resizeObserver.observe(document.documentElement);

	let refreshTimer = null;
	const scheduleRefresh = () => {
		clearTimeout(refreshTimer);
		refreshTimer = setTimeout(() => ScrollTrigger.refresh(true), 250);
	};

	window.addEventListener("transitionend", (e) => {
		if (e.propertyName === "height" || e.propertyName === "max-height") {
			lenis.resize();
			scheduleRefresh();
		}
	});

	window.addEventListener("load", () => {
		lenis.resize();
		ScrollTrigger.refresh(true);
	});

	lenisInstance = lenis;
	return lenis;
}

export function refreshScroll() {
	requestAnimationFrame(() => {
		lenisInstance?.resize();
		clearTimeout(window.__stRefresh);
		window.__stRefresh = setTimeout(() => ScrollTrigger.refresh(true), 250);
	});
}
