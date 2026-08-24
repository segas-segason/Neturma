import Lenis from "lenis";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function initAnimationPageLenis() {
	const lenis = new Lenis({
		lerp: 0.03,
	});

	lenis.on("scroll", ScrollTrigger.update);

	function raf(time) {
		lenis.raf(time);
		requestAnimationFrame(raf);
	}

	requestAnimationFrame(raf);
}
