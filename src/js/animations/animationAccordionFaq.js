import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function initAnimationAccordionFaq() {
	const items = document.querySelectorAll(".faq-item");

	if (!items.length) return;

	function openItem(item) {
		const content = item.querySelector(".faq-item__content");
		const icon = item.querySelector(".faq-item__icon");

		if (item.classList.contains("is-open")) return;

		item.classList.add("is-open");

		// Временно делаем контент видимым, чтобы измерить его реальную высоту
		const currentHeight = content.style.height;
		const currentOverflow = content.style.overflow;

		content.style.height = "auto";
		content.style.overflow = "hidden";
		const targetHeight = content.scrollHeight;

		// Возвращаем высоту к 0 для старта анимации
		content.style.height = "0";
		content.style.overflow = currentOverflow || "hidden"; // обычно 'hidden'

		// Анимация от 0 к реальной высоте
		gsap.to(content, {
			height: targetHeight,
			duration: 0.5,
			ease: "power2.out",
			onComplete: () => {
				// После завершения сбрасываем на auto, чтобы контент мог адаптироваться
				gsap.set(content, { height: "auto" });
				// Обновляем ScrollTrigger после изменения высоты
				ScrollTrigger.refresh();
			},
		});

		// Анимация иконки
		gsap.fromTo(
			icon,
			{ scale: 0.5, opacity: 0 },
			{
				scale: 1,
				opacity: 1,
				duration: 0.2,
				onStart: () => {
					icon.textContent = "−";
				},
			}
		);
	}

	function closeItem(item) {
		const content = item.querySelector(".faq-item__content");
		const icon = item.querySelector(".faq-item__icon");

		if (!item.classList.contains("is-open")) return;

		item.classList.remove("is-open");

		// Фиксируем текущую высоту для плавной анимации
		const currentHeight = content.offsetHeight;
		gsap.set(content, { height: currentHeight });

		gsap.to(content, {
			height: 0,
			duration: 0.4,
			ease: "power2.inOut",
			onComplete: () => {
				// Обновляем ScrollTrigger после закрытия
				ScrollTrigger.refresh();
			},
		});

		gsap.fromTo(
			icon,
			{ scale: 0.5, opacity: 0 },
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

			// Закрываем все остальные открытые элементы
			items.forEach((otherItem) => {
				if (
					otherItem !== item &&
					otherItem.classList.contains("is-open")
				) {
					closeItem(otherItem);
				}
			});

			// Открываем или закрываем текущий
			if (isOpen) {
				closeItem(item);
			} else {
				openItem(item);
			}
		});
	});
}
