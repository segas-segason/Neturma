import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function initAnimationAccordionSections({
	root = document,
	sectionSelector = ".menu-item",
	triggerSelector = '[id="menu-item-trigger"]',
	panelSelector = '[id="menu-item-panel"]',
	duration = 0.8,
	openDelay = 0.12,
	closeDelay = 0.12,
	ease = "power2.inOut",
} = {}) {
	if (typeof window === "undefined") return;

	const sections = gsap.utils.toArray(sectionSelector, root);
	if (!sections.length) return;

	const reduced = window.matchMedia(
		"(prefers-reduced-motion: reduce)"
	).matches;

	const d = reduced ? 0 : duration;
	const od = reduced ? 0 : openDelay;
	const cd = reduced ? 0 : closeDelay;

	const scenes = gsap.utils.toArray(".scene", root);

	const getSceneNumber = (scene) => {
		if (!scene) return null;

		const className = [...scene.classList].find((name) =>
			name.startsWith("scene--")
		);

		return className?.replace("scene--", "") ?? null;
	};

	const getSceneBackground = (scene) => {
		const number = getSceneNumber(scene);

		if (!number) return null;

		return root.querySelector(`.fixed-bg--${number}`);
	};

	const getSceneClip = (scene) => {
		const number = getSceneNumber(scene);

		if (!number) return null;

		return root.querySelector(`.scene-bg--${number}`);
	};

	const updateClip = (clipScene, background) => {
		if (!clipScene || !background) return;

		const rect = clipScene.getBoundingClientRect();

		const top = Math.max(0, rect.top);
		const bottom = Math.max(0, window.innerHeight - rect.bottom);

		background.style.setProperty("--clip-top", `${top}px`);

		background.style.setProperty("--clip-bottom", `${bottom}px`);
	};

	const initSceneClip = (clipScene, background) => {
		if (!clipScene || !background) return;

		updateClip(clipScene, background);

		ScrollTrigger.create({
			trigger: clipScene,

			start: "top bottom",
			end: "bottom top",

			onUpdate: () => {
				updateClip(clipScene, background);
			},

			onEnter: () => {
				updateClip(clipScene, background);
			},

			onEnterBack: () => {
				updateClip(clipScene, background);
			},

			onLeave: () => {
				updateClip(clipScene, background);
			},

			onLeaveBack: () => {
				updateClip(clipScene, background);
			},
		});
	};

	scenes.forEach((scene) => {
		const clipScene = getSceneClip(scene);
		const background = getSceneBackground(scene);

		if (!clipScene || !background) return;

		initSceneClip(clipScene, background);
	});

	sections.forEach((section) => {
		const trigger = section.querySelector(triggerSelector);
		const panel = section.querySelector(panelSelector);

		if (!trigger || !panel) return;

		const scene = section.matches(".scene")
			? section
			: section.querySelector(".scene");

		const clipScene = scene ? getSceneClip(scene) : null;

		const background = scene ? getSceneBackground(scene) : null;

		trigger.setAttribute("role", "button");
		trigger.tabIndex = 0;
		trigger.setAttribute("aria-expanded", "false");

		gsap.set(panel, {
			height: 0,
			overflow: "hidden",
		});

		const killAnimations = () => {
			gsap.killTweensOf(panel);
		};

		const updateSceneClip = () => {
			if (clipScene && background) {
				updateClip(clipScene, background);
			}
		};

		const open = () => {
			if (section.classList.contains("is-open")) return;

			section.classList.add("is-open");
			trigger.setAttribute("aria-expanded", "true");

			killAnimations();

			const targetHeight = panel.scrollHeight;

			gsap.set(panel, {
				height: panel.offsetHeight,
				overflow: "hidden",
			});

			gsap.to(panel, {
				height: targetHeight,
				duration: d,
				delay: od,
				ease,
				overwrite: true,

				onUpdate: updateSceneClip,

				onComplete: () => {
					if (!section.classList.contains("is-open")) return;

					gsap.set(panel, {
						height: "auto",
						overflow: "visible",
					});

					updateSceneClip();

					ScrollTrigger.refresh();
				},
			});
		};

		const close = () => {
			if (!section.classList.contains("is-open")) return;

			section.classList.remove("is-open");
			trigger.setAttribute("aria-expanded", "false");

			killAnimations();

			const currentHeight = panel.offsetHeight;

			gsap.set(panel, {
				height: currentHeight,
				overflow: "hidden",
			});

			gsap.to(panel, {
				height: 0,
				duration: d,
				delay: cd,
				ease,
				overwrite: true,

				onUpdate: updateSceneClip,

				onComplete: () => {
					if (section.classList.contains("is-open")) return;

					gsap.set(panel, {
						height: 0,
					});

					updateSceneClip();

					ScrollTrigger.refresh();
				},
			});
		};

		const toggle = () => {
			if (section.classList.contains("is-open")) {
				close();
			} else {
				open();
			}
		};

		trigger.addEventListener("click", toggle);

		trigger.addEventListener("keydown", (event) => {
			if (event.key === "Enter" || event.key === " ") {
				event.preventDefault();
				toggle();
			}
		});
	});
}
