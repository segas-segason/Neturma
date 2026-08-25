import gsap from "gsap";
import { AirParticles } from "./animationDust";
import { initAnimationLogoMaskEffect } from "./animationLogoMaskEffect";

export function initAnimationHero() {
	const heroSection = document.querySelector("#hero");
	const toggle = document.querySelector("#sidebar-toggle");

	if (!heroSection) return;

	const year = heroSection.querySelector("#hero-year");
	const city = heroSection.querySelector("#hero-city");
	const logo = heroSection.querySelector(".logo");
	const slogan = heroSection.querySelector("#hero-slogan");
	const cta = heroSection.querySelector("#hero-cta");
	const address = heroSection.querySelector("#hero-address");
	const btnDown = heroSection.querySelector("#hero-btn-down");
	const dustLayer = document.querySelector("#air");

	const dust = new AirParticles();
	dust.init();

	const enableLogoMask = initAnimationLogoMaskEffect();

	gsap.set(logo, {
		autoAlpha: 0,
		transform: "scale(0)",
		transformOrigin: "center center",
		willChange: "transform, opacity",
	});

	gsap.set([city, year, slogan], {
		autoAlpha: 0,
		yPercent: 30,
	});

	gsap.set([cta, address, btnDown], {
		autoAlpha: 0,
		yPercent: 30,
	});

	if (toggle) {
		gsap.set(toggle, {
			autoAlpha: 0,
			transform: "scale(0)",
			pointerEvents: "none",
		});
	}

	gsap.set(dustLayer, {
		autoAlpha: 0,
		transform: "scale(0)",
		willChange: "transform, opacity",
	});

	const tl = gsap.timeline({
		delay: 0.2,
		defaults: {
			ease: "power4.out",
			duration: 1,
		},
	});

	tl.to(logo, {
		autoAlpha: 1,
		transform: "scale(1)",
		duration: 1.5,
		ease: "power4.out",
	})

		.call(() => {
			enableLogoMask?.();
		})

		.to(
			dustLayer,
			{
				autoAlpha: 1,
				transform: "scale(1)",
				duration: 1.6,
				ease: "power2.out",
			},
			"0"
		)

		.to(
			[city, year, slogan],
			{
				autoAlpha: 1,
				yPercent: 0,
				stagger: 0.1,
			},
			"-=0.8"
		)
		.to(
			[cta, address, btnDown],
			{
				autoAlpha: 1,
				yPercent: 0,
				stagger: 0.15,
			},
			"-=0.7"
		)
		.to(
			toggle,
			{
				autoAlpha: 1,
				transform: "scale(1)",
				pointerEvents: "auto",
				duration: 0.8,
				ease: "power4.out",
			},
			"-=0.8"
		);

	let completed = false;

	const events = ["click", "wheel", "touchstart"];

	const finish = () => {
		if (completed) return;

		completed = true;

		tl.pause().progress(1);

		events.forEach((event) => {
			window.removeEventListener(event, finish);
		});

		window.dispatchEvent(new CustomEvent("hero:complete"));
	};

	tl.eventCallback("onComplete", finish);

	events.forEach((event) => {
		window.addEventListener(event, finish, {
			once: true,
			passive: true,
		});
	});
}
