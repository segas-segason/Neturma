import gsap from "gsap";

export function initAnimationSidebar() {
	const sidebar = document.querySelector("#sidebar-nav");
	const logo = document.querySelector("#sidebar-logo");
	const toggle = document.querySelector("#sidebar-toggle");

	const itemMenuText = document.querySelectorAll(".sidebar-link-label");

	const bottom = document.querySelector("#sidebar-footer");

	const lineTop = document.querySelector(".l--top");
	const lineMid = document.querySelector(".l--mid");
	const lineBot = document.querySelector(".l--bot");

	if (
		!sidebar ||
		!logo ||
		!toggle ||
		!itemMenuText.length ||
		!bottom ||
		!lineTop ||
		!lineMid ||
		!lineBot
	) {
		return;
	}

	// Логотип
	gsap.set(logo, {
		autoAlpha: 0,
		yPercent: -100,
		pointerEvents: "none",
	});

	// Пункты меню
	gsap.set(itemMenuText, {
		autoAlpha: 0,
		xPercent: 30,
		pointerEvents: "none",
	});

	// Нижняя кнопка
	gsap.set(bottom, {
		autoAlpha: 0,
		yPercent: 100,
		pointerEvents: "none",
	});

	const tl = gsap.timeline({
		paused: true,
		reversed: true,
	});

	tl.to(sidebar, {
		width: "320px",
		duration: 0.35,
		ease: "power2.inOut",
	})

		.to(
			lineTop,
			{
				attr: {
					x1: 6,
					y1: 6,
					x2: 26,
					y2: 26,
				},
				duration: 0.3,
				ease: "power2.inOut",
			},
			"<"
		)

		.to(
			lineBot,
			{
				attr: {
					x1: 26,
					y1: 6,
					x2: 6,
					y2: 26,
				},
				duration: 0.3,
				ease: "power2.inOut",
			},
			"<"
		)

		.to(
			lineMid,
			{
				autoAlpha: 0,
				duration: 0.15,
			},
			"<"
		)

		.to(logo, {
			autoAlpha: 1,
			yPercent: 0,
			pointerEvents: "auto",
			duration: 0.4,
			ease: "power2.out",
		})

		.to(
			bottom,
			{
				autoAlpha: 1,
				yPercent: 0,
				pointerEvents: "auto",
				duration: 0.4,
				ease: "power2.out",
			},
			"<"
		)

		.to(
			itemMenuText,
			{
				autoAlpha: 1,
				xPercent: 0,
				pointerEvents: "auto",
				duration: 0.35,
				stagger: 0.06,
				ease: "power2.out",
			},
			"<0.1"
		);

	toggle.addEventListener("click", () => {
		if (tl.isActive()) {
			return;
		}

		if (tl.reversed()) {
			tl.play();

			toggle.setAttribute("aria-expanded", "true");
			toggle.setAttribute("aria-label", "Закрыть меню");
		} else {
			tl.reverse();

			toggle.setAttribute("aria-expanded", "false");
			toggle.setAttribute("aria-label", "Открыть меню");
		}
	});
}
