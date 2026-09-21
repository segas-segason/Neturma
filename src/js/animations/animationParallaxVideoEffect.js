import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function initAnimationVideoScroll() {
	const scenes = gsap.utils.toArray(".scene");

	scenes.forEach((scene) => {
		const sceneClass = [...scene.classList].find((className) =>
			className.startsWith("scene--")
		);
		if (!sceneClass) return;

		const number = sceneClass.replace("scene--", "");
		const background = document.querySelector(`.fixed-bg--${number}`);
		if (!background) return;

		const video = background.querySelector("video");
		if (!video) return;

		video.preload = "auto";

		const initVideoScroll = () => {
			const duration = video.duration;
			if (!duration || !Number.isFinite(duration)) return;

			video.currentTime = 0;

			const start = scene.classList.contains("scene--1")
				? "top top"
				: "top bottom";

			ScrollTrigger.create({
				trigger: scene,
				start,
				end: "bottom top",
				scrub: 1,
				onUpdate: (self) => {
					const isAnimating =
						scene.classList.contains("is-animating") ||
						scene
							.closest?.(".menu-item")
							?.classList.contains("is-animating") ||
						false;

					if (!isAnimating) {
						video.currentTime = self.progress * duration;
					}
				},
				onRefresh: (self) => {
					const isAnimating =
						scene.classList.contains("is-animating") ||
						scene
							.closest?.(".menu-item")
							?.classList.contains("is-animating") ||
						false;

					if (!isAnimating && self.progress !== undefined) {
						video.currentTime = self.progress * duration;
					}
				},
			});
		};

		if (video.readyState >= 1) {
			initVideoScroll();
		} else {
			video.addEventListener("loadedmetadata", initVideoScroll, {
				once: true,
			});
		}
	});
}
