import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function initAnimateOnFreedomContent(panel) {
	if (!panel) {
		return {
			open: () => null,
			close: () => null,
			destroy: () => {},
		};
	}

	const lineContent = gsap.utils.toArray(
		panel.querySelectorAll("#line-content")
	);
	const background = panel.querySelector("[data-freedom-bg]");
	const backgroundWrapper = panel.querySelector("[data-freedom-bg-wrapper]");
	const textItems = gsap.utils.toArray(panel.querySelectorAll("p"));
	const lineHidden = document.querySelector("[data-freedom-line-hidden]");

	let openTimeline = null;
	let closeTimeline = null;
	let isDestroyed = false;
	let parallaxTrigger = null;
	let parallaxTo = null;
	const parallaxMedia = gsap.matchMedia();
	const flickerMedia = gsap.matchMedia();
	const backgroundContext = gsap.context(() => {
		if (backgroundWrapper) {
			gsap.set(backgroundWrapper, { scale: 1.08, yPercent: -3 });
		}
	});

	const opened = () => {
		if (isDestroyed) return;

		flickerMedia.revert();
		if (background) {
			flickerMedia.add("(prefers-reduced-motion: no-preference)", () => {
				const flickerTimeline = gsap.timeline({
					paused: true,
					repeat: -1,
					repeatDelay: 3.7,
					defaults: { ease: "steps(1)" },
				});

				flickerTimeline
					.set(background, { filter: "grayscale(0)" })
					.to(
						background,
						{ filter: "grayscale(1)", duration: 0.1 },
						0.2
					)
					.to(
						background,
						{ filter: "grayscale(0)", duration: 0.3 },
						0.34
					)
					.to(
						background,
						{ filter: "grayscale(1)", duration: 0.06 },
						0.58
					)
					.to(
						background,
						{ filter: "grayscale(0)", duration: 0.1 },
						0.68
					)
					.to(
						background,
						{ filter: "grayscale(1)", duration: 0.2 },
						1.1
					)
					.to(
						background,
						{ filter: "grayscale(0)", duration: 0.1 },
						1.38
					);

				ScrollTrigger.create({
					trigger: panel,
					start: "top bottom",
					end: "bottom top",
					animation: flickerTimeline,
					toggleActions: "play pause resume pause",
				});
			});
		}

		if (!backgroundWrapper) return;

		parallaxMedia.revert();
		parallaxMedia.add("(prefers-reduced-motion: no-preference)", () => {
			parallaxTo = gsap.quickTo(backgroundWrapper, "yPercent", {
				duration: 0.8,
				ease: "power2.out",
			});
			parallaxTrigger = ScrollTrigger.create({
				trigger: panel,
				start: "top bottom",
				end: "bottom top",
				onUpdate: (self) => parallaxTo(-3 + self.progress * 6),
			});
			parallaxTo(-3 + parallaxTrigger.progress * 6);
		});
	};

	const setInitialState = () => {
		if (background) {
			gsap.set(background, {
				opacity: 0,
				yPercent: 10,
			});
		}

		if (lineContent.length) {
			gsap.set(lineContent, {
				clipPath: "inset(0 0 100% 0)",
				opacity: 0,
			});
		}

		if (textItems.length) {
			gsap.set(textItems, {
				opacity: 0,
			});
		}
	};

	const open = () => {
		if (isDestroyed) return null;
		flickerMedia.revert();

		if (openTimeline) {
			openTimeline.kill();
			openTimeline = null;
		}
		if (closeTimeline) {
			closeTimeline.kill();
			closeTimeline = null;
		}

		setInitialState();
		parallaxMedia.revert();
		parallaxTrigger = null;
		parallaxTo = null;

		openTimeline = gsap.timeline({
			defaults: {
				ease: "power2.out",
			},
		});

		if (background) {
			openTimeline.to(
				background,
				{
					opacity: 1,
					duration: 1.2,
					overwrite: "auto",
					yPercent: 0,
				},
				0
			);
		}

		if (lineHidden) {
			openTimeline.to(
				lineHidden,
				{
					opacity: 0,
				},
				0
			);
		}

		if (lineContent) {
			openTimeline.to(
				lineContent,
				{
					clipPath: "inset(0 0 0% 0)",
					opacity: 1,
					duration: 0.7,
				},

				0.2
			);
		}

		if (textItems.length) {
			openTimeline.to(
				textItems,
				{
					opacity: 1,
					duration: 0.6,
					stagger: 0.15,
					ease: "power2.out",
				},
				0.4
			);
		}

		return openTimeline;
	};

	const close = () => {
		if (isDestroyed) return null;
		flickerMedia.revert();
		parallaxTrigger?.disable(false);
		parallaxTo?.tween.pause();

		if (openTimeline) {
			openTimeline.kill();
			openTimeline = null;
		}

		if (closeTimeline) {
			closeTimeline.kill();
			closeTimeline = null;
		}

		closeTimeline = gsap.timeline({
			defaults: {
				ease: "power2.in",
			},
		});

		if (textItems.length) {
			closeTimeline.to(
				textItems,
				{
					opacity: 0,
					duration: 0.35,
				},
				0
			);
		}

		if (lineContent) {
			closeTimeline.to(
				lineContent,
				{
					clipPath: "inset(0 0 100% 0)",
					opacity: 0,
					duration: 0.5,
				},
				0
			);
		}

		if (background) {
			closeTimeline.to(
				background,
				{
					opacity: 0,
					yPercent: 10,
					duration: 0.7,
				},
				0
			);
		}

		if (lineHidden) {
			closeTimeline.to(
				lineHidden,
				{
					opacity: 1,
					duration: 0.5,
				},
				0
			);
		}

		return closeTimeline;
	};

	const destroy = () => {
		if (isDestroyed) return;
		flickerMedia.revert();
		parallaxMedia.revert();
		backgroundContext.revert();

		if (openTimeline) {
			openTimeline.kill();
			openTimeline = null;
		}
		if (closeTimeline) {
			closeTimeline.kill();
			closeTimeline = null;
		}

		isDestroyed = true;
	};

	return {
		open,
		opened,
		close,
		destroy,
	};
}
