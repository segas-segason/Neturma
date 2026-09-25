import { gsap } from "gsap";

export function initAnimationNotFound() {
	const page = document.querySelector("#page-404");

	if (!page) return null;

	const title = page.querySelector("h1");
	const slogan = page.querySelector("p");
	const button = page.querySelector("a");
	const canAnimate = window.matchMedia(
		"(prefers-reduced-motion: no-preference)"
	).matches;

	if (!title || !slogan || !button || !canAnimate) return null;

	gsap.set(title, {
		autoAlpha: 0,
		scale: 0.3,
		transformOrigin: "center center",
		willChange: "transform, opacity",
	});

	gsap.set(slogan, {
		yPercent: -20,
		autoAlpha: 0,
	});

	gsap.set(button, {
		autoAlpha: 0,
		yPercent: -30,
	});

	return gsap
		.timeline({
			delay: 0.2,
			defaults: {
				ease: "power4.out",
				duration: 1,
			},
		})
		.to(title, {
			autoAlpha: 1,
			scale: 1,
			duration: 1.5,
		})
		.to(
			slogan,
			{
				yPercent: 0,
				autoAlpha: 1,
			},
			"-=0.8"
		)
		.to(
			button,
			{
				autoAlpha: 1,
				yPercent: 0,
				ease: "power2.out",
			},
			"-=0.6"
		);
}
