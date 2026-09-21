import { gsap } from "gsap";

export function initAnimateAboutProjectContent(panel) {
	if (!panel) {
		return {
			open: () => null,
			close: () => null,
			destroy: () => {},
		};
	}

	const lineContent = panel.querySelector("#line-content");
	const background = document.querySelector("[data-scene-bg-neturma]");
	const textItems = gsap.utils.toArray(panel.querySelectorAll("p, h3"));
	const lineHidden = document.querySelector("[data-project-line-hidden]");

	let openTimeline = null;
	let closeTimeline = null;
	let isDestroyed = false;

	const setInitialState = () => {
		if (background) {
			gsap.set(background, {
				opacity: 0,
				y: 30,
			});
		}

		if (lineContent) {
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

		if (openTimeline) {
			openTimeline.kill();
			openTimeline = null;
		}
		if (closeTimeline) {
			closeTimeline.kill();
			closeTimeline = null;
		}

		setInitialState();

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
					y: 0,
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
					y: 10,
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
		close,
		destroy,
	};
}
