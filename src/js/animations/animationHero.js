import gsap from "gsap";
import { initAnimationLogoMaskEffect } from "./animationLogoMaskEffect";

export function initAnimationHero() {
	const heroSection = document.querySelector("#hero");
	const toggle = document.querySelector("#sidebar-toggle");

	if (!heroSection) {
		document.documentElement.classList.remove("hero-pending");
		return;
	}

	const year = heroSection.querySelector("#hero-year");
	const city = heroSection.querySelector("#hero-city");
	const logo = heroSection.querySelector("#logo-head");
	const slogan = heroSection.querySelector("#hero-slogan");
	const btnDown = heroSection.querySelector("#hero-btn-down");
	const dustLayer = document.querySelector("#air");

	if (!dustLayer) {
		document.documentElement.classList.remove("hero-pending");
		return;
	}

	const enableLogoMask = initAnimationLogoMaskEffect();

	gsap.set(logo, {
		opacity: 0,
		scale: 0,
		transformOrigin: "center center",
		willChange: "transform, opacity",
	});

	gsap.set([city, year], {
		yPercent: 120,
	});

	gsap.set(slogan, {
		yPercent: -120,
	});

	gsap.set(btnDown, {
		autoAlpha: 0,
		yPercent: -30,
	});

	if (toggle) {
		gsap.set(toggle, {
			autoAlpha: 0,
			scale: 0,
			pointerEvents: "none",
		});
	}

	gsap.set(dustLayer, {
		autoAlpha: 0,
		scale: 0,
		transformOrigin: "center center",
	});

	document.documentElement.classList.remove("hero-pending");

	const tl = gsap.timeline({
		delay: 0.2,

		defaults: {
			ease: "power4.out",
			duration: 1,
		},
	});

	tl.to(
		dustLayer,
		{
			autoAlpha: 1,
			scale: 1,
			duration: 1.5,
			ease: "power2.out",
		},
		"0"
	)

		.to(
			logo,
			{
				opacity: 1,
				scale: 1,
				duration: 1.5,
				ease: "power4.out",
			},
			"0"
		)

		.call(() => {
			enableLogoMask?.();
		})

		.to(
			[city, slogan],
			{
				yPercent: 0,
			},
			"-=0.8"
		)

		.to(
			year,
			{
				yPercent: 0,
			},
			"-=0.7"
		)

		.to(
			btnDown,
			{
				autoAlpha: 1,
				yPercent: 0,
				ease: "power2.out",
			},
			"<"
		);

	if (toggle) {
		tl.to(
			toggle,
			{
				autoAlpha: 1,
				scale: 1,
				pointerEvents: "auto",
				duration: 0.8,
				ease: "power4.out",
			},
			"-=0.7"
		);
	}

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
