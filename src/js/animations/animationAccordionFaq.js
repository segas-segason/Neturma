import { gsap } from "gsap";

export function initAnimationAccordionFaq() {
	const items = document.querySelectorAll(".faq-item");
	if (!items.length) return;

	function openItem(item) {
		const content = item.querySelector(".faq-item__content");
		const icon = item.querySelector(".faq-item__icon");

		item.classList.add("is-open");

		content.style.height = "auto";
		const targetHeight = content.scrollHeight;
		content.style.height = "0";

		gsap.to(content, {
			height: targetHeight,
			duration: 0.4,
			ease: "power2.out",
			onComplete: () => {
				gsap.set(content, { height: "auto" });
			},
		});

		icon.textContent = "-";
	}

	function closeItem(item) {
		const content = item.querySelector(".faq-item__content");
		const icon = item.querySelector(".faq-item__icon");

		item.classList.remove("is-open");

		const currentHeight = content.offsetHeight;
		gsap.set(content, { height: currentHeight });

		gsap.to(content, {
			height: 0,
			duration: 0.3,
			ease: "power2.in",
		});

		icon.textContent = "+";
	}

	items.forEach((item) => {
		const trigger = item.querySelector(".faq-item__trigger");
		trigger.addEventListener("click", () => {
			const isOpen = item.classList.contains("is-open");

			items.forEach((other) => {
				if (other !== item && other.classList.contains("is-open")) {
					closeItem(other);
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
