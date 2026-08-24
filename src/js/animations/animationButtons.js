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
