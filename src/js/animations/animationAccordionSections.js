import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initAnimateAboutProjectContent } from "./animateAboutProjectContent";
import { initAnimateArtObjectsContent } from "./animateArtObjectsContent";
import { initAnimateAboutVisitContent } from "./animateAboutVisitContent";
import { initAnimateOnFreedomContent } from "./animateOnFreedomContent";
import { initAnimateAboutFoodContent } from "./animateAboutFoodContent";
import { initAnimationSceneBackground } from "./animateSceneBackground";

gsap.registerPlugin(ScrollTrigger);

ScrollTrigger.config({
	limitCallbacks: true,
	ignoreMobileResize: true,
});

export function initAnimationAccordionSections(options = {}) {
	const {
		root = document,
		sectionSelector = ".menu-item",
		triggerSelector = '[id="menu-item-trigger"]',
		panelSelector = '[id="menu-item-panel"]',
		backgroundMap = {},
	} = options;

	const sections = root.querySelectorAll(sectionSelector);
	const sectionControllers = new Map();

	if (!sections.length) return;

	const globalBackgrounds = {};

	sections.forEach((section) => {
		const bgOptions = backgroundMap[section.id];
		if (bgOptions) {
			globalBackgrounds[section.id] = initAnimationSceneBackground({
				...bgOptions,
				triggerSelector: bgOptions.triggerSelector || `#${section.id}`,
			});
		}
	});

	sections.forEach((section) => {
		const trigger = section.querySelector(triggerSelector);
		const panel = section.querySelector(panelSelector);

		if (!trigger || !panel) return;

		let isOpen = false;
		let panelAnimation = null;
		let contentAnimation = null;

		gsap.set(panel, {
			height: 0,
			overflow: "hidden",
		});

		const getContentAnimator = (sectionId) => {
			switch (sectionId) {
				case "about-project":
					return initAnimateAboutProjectContent;
				case "art-objects-section":
					return initAnimateArtObjectsContent;
				case "about-visit":
					return initAnimateAboutVisitContent;
				case "on-freedom":
					return initAnimateOnFreedomContent;
				case "about-food":
					return initAnimateAboutFoodContent;
				default:
					return null;
			}
		};

		const backgroundAnimation = globalBackgrounds[section.id] || null;

		const destroyAllAnimations = () => {
			if (panelAnimation) {
				panelAnimation.kill();
				panelAnimation = null;
			}

			gsap.killTweensOf(panel);

			if (contentAnimation) {
				if (typeof contentAnimation.destroy === "function") {
					contentAnimation.destroy();
				}
				contentAnimation = null;
			}
		};

		const calculateDuration = (
			height,
			speed = 1200,
			min = 0.4,
			max = 2.5
		) => {
			const duration = height / speed;
			return Math.min(Math.max(duration, min), max);
		};

		const completeOpen = () => {
			gsap.set(panel, { height: "auto" });

			if (backgroundAnimation) {
				backgroundAnimation.updateSize();
			}

			ScrollTrigger.refresh();
			contentAnimation?.opened?.();

			section.dispatchEvent(
				new CustomEvent("menu-item:opened", { bubbles: true })
			);
		};

		const openSection = ({ immediate = false } = {}) => {
			if (isOpen) return;
			destroyAllAnimations();
			isOpen = true;
			trigger.setAttribute("aria-expanded", "true");

			const bgContainer = section.querySelector(
				"[data-scene-bg-neturma]"
			);
			if (bgContainer) {
				bgContainer.classList.add("is-active");
			}

			const animatorFn = getContentAnimator(section.id);
			if (animatorFn) {
				contentAnimation = animatorFn(panel);
			}

			// 1. Измеряем реальную высоту контента
			gsap.set(panel, { height: "auto" });
			const contentHeight = panel.scrollHeight;
			gsap.set(panel, { height: 0 });

			const duration = calculateDuration(contentHeight);

			// 2. Запускаем анимацию контента.
			// Если она имеет свою длительность, её ScrollTrigger-ы должны оживать ПОСЛЕ открытия панели.
			const contentTimeline = contentAnimation?.open?.();

			if (immediate) {
				contentTimeline?.progress?.(1);
				completeOpen();
				return;
			}

			panelAnimation = gsap.to(panel, {
				height: contentHeight,
				duration,
				ease: "power2.out",
				onComplete: completeOpen,
			});
		};

		const closeSection = () => {
			if (!isOpen) return;
			isOpen = false;
			trigger.setAttribute("aria-expanded", "false");

			const bgContainer = section.querySelector(
				"[data-scene-bg-neturma]"
			);
			if (bgContainer) {
				bgContainer.classList.remove("is-active");
			}

			if (contentAnimation?.close) {
				contentAnimation.close();
			}

			const currentHeight = panel.offsetHeight;
			const duration = calculateDuration(currentHeight);

			if (panelAnimation) {
				panelAnimation.kill();
				panelAnimation = null;
			}
			gsap.killTweensOf(panel);

			panelAnimation = gsap.to(panel, {
				height: 0,
				duration,
				ease: "power2.inOut",
				onComplete: () => {
					if (
						contentAnimation &&
						typeof contentAnimation.destroy === "function"
					) {
						contentAnimation.destroy();
					}
					contentAnimation = null;

					// 4. После закрытия бэкграунд тоже должен обновить размеры
					if (backgroundAnimation) {
						backgroundAnimation.updateSize();
					}

					ScrollTrigger.refresh();

					section.dispatchEvent(
						new CustomEvent("menu-item:closed", { bubbles: true })
					);
				},
			});
		};

		trigger.addEventListener("click", () => {
			if (isOpen) {
				closeSection();
			} else {
				openSection();
			}
		});

		sectionControllers.set(section.id, {
			open: openSection,
		});
	});

	return {
		open: (sectionId, options) => {
			const id = sectionId.startsWith("#")
				? sectionId.slice(1)
				: sectionId;
			const controller = sectionControllers.get(id);

			if (!controller) return false;

			controller.open(options);
			return true;
		},
		destroy: () => {
			Object.values(globalBackgrounds).forEach((bg) => {
				if (bg && typeof bg.destroy === "function") bg.destroy();
			});
		},
	};
}
