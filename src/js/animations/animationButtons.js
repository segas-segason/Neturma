import { gsap } from "gsap";

export function initAnimationButtons(selector = ".btn") {
	if (!window.matchMedia("(hover: hover)").matches) return;

	document.querySelectorAll(selector).forEach((btn) => {
		if (btn.dataset.btnAnimated) return;
		btn.dataset.btnAnimated = "true";

		const text = btn.textContent.trim();

		btn.setAttribute("aria-label", text);
		btn.textContent = "";

		const label = document.createElement("span");
		label.className = "btn__label";
		label.setAttribute("aria-hidden", "true");

		const current = document.createElement("span");
		current.className = "btn__label-item";
		current.textContent = text;

		const next = document.createElement("span");
		next.className = "btn__label-item btn__label-item--clone";
		next.textContent = text;

		label.append(current, next);
		btn.append(label);

		gsap.set([current, next], { yPercent: 0 });

		const tl = gsap
			.timeline({
				paused: true,
				defaults: {
					duration: 0.45,
					ease: "power3.out",
				},
			})
			.to(
				[current, next],
				{
					yPercent: -100,
				},
				0
			);

		btn.addEventListener("mouseenter", () => tl.play());
		btn.addEventListener("mouseleave", () => tl.reverse());
	});
}

export function initAnimateButtonDown() {
	const btnDown = document.querySelector("#hero-btn-down");
	if (!btnDown) return;

	if (!window.matchMedia("(hover: hover)").matches) return;

	if (btnDown.dataset.btnAnimated) return;
	btnDown.dataset.btnAnimated = "true";

	const textContainer = btnDown.querySelector(".btn-down-label");
	if (!textContainer) return;

	const textSpan = textContainer.querySelector(":scope > span:last-child");
	if (!textSpan) return;

	if (textContainer.querySelectorAll(":scope > span").length === 1) {
		const textParts = textSpan.textContent.trim().split(/\s+/);

		if (textParts.length > 1) {
			const fixedText = document.createElement("span");
			fixedText.textContent = textParts.slice(0, -1).join(" ");
			textSpan.textContent = textParts.at(-1);
			textContainer.prepend(fixedText);
		}
	}

	const originalText = textSpan.textContent.trim();
	const hoverText = "узником";

	textSpan.textContent = "";

	const label = document.createElement("span");
	label.className = "btn-hero__label";

	const current = document.createElement("span");
	current.className = "btn-hero__label-item";
	current.textContent = originalText;

	const next = document.createElement("span");
	next.className = "btn-hero__label-item";
	next.textContent = hoverText;

	label.append(current, next);
	textSpan.append(label);

	gsap.set([current, next], { yPercent: 0 });

	const tl = gsap
		.timeline({
			paused: true,
			defaults: {
				duration: 0.45,
				ease: "power3.out",
			},
		})
		.to([current, next], { yPercent: -100 }, 0);

	btnDown.addEventListener("mouseenter", () => tl.play());
	btnDown.addEventListener("mouseleave", () => tl.reverse());
}
