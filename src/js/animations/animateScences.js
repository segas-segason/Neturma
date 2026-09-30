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
		frameCount: 147,
		framePath: "/assets/img/man-painter-frames/frame-{index}.webp",
		start: "top bottom",
		end: "bottom top",
		scrub: 0,
		ease: "none",
		useWindowSize: true,
		horizontalPosition: 1,
		mobileHorizontalPan: true,
		mobileHorizontalStartPosition: 0.5,
	});
}
