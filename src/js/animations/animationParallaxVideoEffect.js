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

		const background = document.querySelector(
			`.fixed-bg--${number}`
		);

		if (!background) return;

		const video = background.querySelector("video");

		if (!video) return;

		const initVideoScroll = () => {
			const duration = video.duration;

			if (!duration || !Number.isFinite(duration)) return;

			// Начинаем с первого кадра
			video.currentTime = 0;

			const start =
				scene.classList.contains("scene--1")
					? "top top"
					: "top bottom";

			ScrollTrigger.create({
				trigger: scene,

				start,
				end: "bottom top",

				scrub: true,

				onUpdate: (self) => {
					video.currentTime = self.progress * duration;
				},
			});
		};

		if (video.readyState >= 1) {
			initVideoScroll();
		} else {
			video.addEventListener(
				"loadedmetadata",
				initVideoScroll,
				{ once: true }
			);
		}
	});
}

/* import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

export function initAnimationParallaxVideoEffect({
	sectionSelector = "#about-project",
	minHeight = "300vh",
	smooth = 0.16,
	start = "top top",
	end = "bottom top",
} = {}) {
	if (typeof window === "undefined") return () => {};

	const section = document.querySelector(sectionSelector);
	if (!section || section.dataset.videoParallaxInit) return () => {};

	const scrollArea = section.querySelector(".video-scroll");
	const sticky = section.querySelector(".video-sticky-wrapper");
	const video = section.querySelector("video");
	const content = section.querySelector(".video-scroll > .relative");

	if (!scrollArea || !video) return () => {};

	section.dataset.videoParallaxInit = "true";

	// Меняем HTML/состояние под эффект
	scrollArea.style.minHeight = minHeight;
	video.setAttribute("preload", "auto");
	video.muted = true;
	video.playsInline = true;
	video.pause();

	if (sticky) {
		sticky.style.willChange = "transform";
	}

	const controller = new AbortController();
	const scrubTriggers = [];

	let ready = false;
	let targetTime = 0;
	let renderTime = 0;

	const updateVideoTime = () => {
		if (!ready || video.seeking || !isFinite(video.duration)) return;

		const diff = targetTime - renderTime;
		if (Math.abs(diff) <= 0.004) return;

		renderTime = gsap.utils.clamp(
			0,
			Math.max(video.duration - 0.05, 0),
			renderTime + diff * smooth
		);

		video.currentTime = renderTime;
	};

	gsap.ticker.add(updateVideoTime);

	const createVideoScrub = () => {
		if (!isFinite(video.duration) || video.duration <= 0) return;

		ready = true;
		renderTime = video.currentTime || 0;
		targetTime = renderTime;

		const trigger = ScrollTrigger.create({
			trigger: scrollArea,
			start,
			end,
			invalidateOnRefresh: true,
			onUpdate: (self) => {
				targetTime = self.progress * video.duration;
			},
			onRefresh: (self) => {
				targetTime = self.progress * video.duration;
			},
		});

		scrubTriggers.push(trigger);
	};

	if (video.readyState >= 2) {
		createVideoScrub();
	} else {
		video.addEventListener("loadeddata", createVideoScrub, {
			once: true,
			signal: controller.signal,
		});
		video.load();
	}

	const ctx = gsap.context(() => {
		// Параллакс самого видео
		gsap.fromTo(
			video,
			{ yPercent: 6, scale: 1.15 },
			{
				yPercent: -6,
				scale: 1.15,
				ease: "none",
				scrollTrigger: {
					trigger: scrollArea,
					start: "top bottom",
					end: "bottom top",
					scrub: 0.5,
					invalidateOnRefresh: true,
				},
			}
		);

		// Параллакс контента поверх видео
		if (content) {
			// Делаем текст белым, чтобы прозрачность уходила именно в белый
			content.style.color = "#ffffff";

			// Параллакс всего текстового блока
			gsap.fromTo(
				content,
				{ y: 110 },
				{
					y: -90,
					ease: "none",
					scrollTrigger: {
						trigger: content,
						start: "top bottom",
						end: "bottom top",
						scrub: 0.5,
						invalidateOnRefresh: true,
					},
				}
			);

			// Плавное появление текста из прозрачного в белый по скроллу
			const textNodes = Array.from(content.querySelectorAll("p, h3"));

			textNodes.forEach((node) => {
				gsap.fromTo(
					node,
					{
						opacity: 0.25,
					},
					{
						opacity: 1,
						ease: "none",
						scrollTrigger: {
							trigger: node,
							start: "top 92%",
							end: "top 55%",
							scrub: 0.6,
							invalidateOnRefresh: true,
						},
					}
				);
			});
		}
	}, section);

	ScrollTrigger.refresh();

	return () => {
		section.removeAttribute("data-video-parallax-init");
		controller.abort();
		gsap.ticker.remove(updateVideoTime);
		scrubTriggers.forEach((trigger) => trigger.kill());
		ctx.kill();
	};
}
 */