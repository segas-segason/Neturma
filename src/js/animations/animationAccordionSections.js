import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function initAnimationAccordionSections({ root = document } = {}) {
	if (typeof window === "undefined") return;

	const scenes = gsap.utils.toArray(".scene", root);
	if (!scenes.length) return;

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
}
