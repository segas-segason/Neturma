import { initAnimationSceneBackground } from "./animateSceneBackground";

export function initAnimationScenes() {
	const sceneAbout = initAnimationSceneBackground({
		canvasSelector: "[data-neturma-canvas]",
		triggerSelector: "[data-about-project]",
		frameCount: 175,
		framePath: "/assets/img/neturma-corridor-frames/frame-{index}.webp",
		start: "top top",
		end: "+=1500",
		ease: "none",
		useWindowSize: true,
	});

	const sceneVisit = initAnimationSceneBackground({
		canvasSelector: "#man-paint-canvas",
		triggerSelector: "[data-screen-visit]",
		frameCount: 150,
		framePath: "/assets/img/man-painter-frames/frame-{index}.webp",
		start: "top bottom",
		end: "+=2500",
		scrub: 0,
		ease: "none",
		useWindowSize: true,
	});
}
