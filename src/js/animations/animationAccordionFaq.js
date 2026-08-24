import { gsap } from "gsap";

export function initAnimationAccordionFaq() {
	const items = document.querySelectorAll(".faq-item");

	if (!items.length) return;

	function openItem(item) {
		const content = item.querySelector(".faq-item__content");
		const icon = item.querySelector(".faq-item__icon");

		item.classList.add("is-open");

		gsap.to(content, {
			height: "auto",
			duration: 0.5,
			ease: "power2.out",
		});

		gsap.fromTo(
			icon,
			{
				scale: 0.5,
				opacity: 0,
			},
			{
				scale: 1,
				opacity: 1,
				duration: 0.2,
				onStart: () => {
					icon.textContent = "-";
				},
			}
		);
	}

	function closeItem(item) {
		const content = item.querySelector(".faq-item__content");
		const icon = item.querySelector(".faq-item__icon");

		item.classList.remove("is-open");

		gsap.to(content, {
			height: 0,
			duration: 0.4,
			ease: "power2.inOut",
		});

		gsap.fromTo(
			icon,
			{
				scale: 0.5,
				opacity: 0,
			},
			{
				scale: 1,
				opacity: 1,
				duration: 0.2,
				onStart: () => {
					icon.textContent = "+";
				},
			}
		);
	}

	items.forEach((item) => {
		const trigger = item.querySelector(".faq-item__trigger");

		trigger.addEventListener("click", () => {
			const isOpen = item.classList.contains("is-open");

			items.forEach((otherItem) => {
				if (
					otherItem !== item &&
					otherItem.classList.contains("is-open")
				) {
					closeItem(otherItem);
				}
			});

			if (isOpen) {
				closeItem(item);
			} else {
				openItem(item);
			}
		});
	});
}
