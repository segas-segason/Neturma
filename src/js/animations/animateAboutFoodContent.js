import { gsap } from "gsap";

export function initAnimateAboutFoodContent(panel) {
	if (!panel) {
		return {
			open: () => null,
			close: () => null,
			destroy: () => {},
		};
	}

	const slogan = panel.querySelector("[data-food-slogan]");
	const topBlock = panel.querySelector("[data-food-top-block]");
	const lineBlock = panel.querySelector("[data-food-line-block]");
	const bottomBlock = panel.querySelector("[data-food-bottom-block]");

	let openTimeline = null;
	let closeTimeline = null;
	let isDestroyed = false;
	let isOpen = false;

	const allElements = [slogan, topBlock, lineBlock, bottomBlock].filter(
		Boolean
	);

	const setInitialState = () => {
		gsap.set(allElements, {
			opacity: 0,
			yPercent: 10,
		});
	};

	const killAllAnimations = () => {
		if (openTimeline) {
			openTimeline.kill();
			openTimeline = null;
		}
		if (closeTimeline) {
			closeTimeline.kill();
			closeTimeline = null;
		}
		allElements.forEach((el) => {
			if (el) gsap.killTweensOf(el);
		});
	};

	const open = () => {
		if (isDestroyed) return null;

		if (isOpen && openTimeline) {
			return openTimeline;
		}

		killAllAnimations();

		if (!isOpen) {
			setInitialState();
		}

		openTimeline = gsap.timeline({
			defaults: {
				ease: "power2.out",
				overwrite: "auto",
			},
			onStart: () => {
				isOpen = true;
			},
			onComplete: () => {
				isOpen = true;
			},
		});

		openTimeline.to(
			allElements,
			{
				opacity: 1,
				yPercent: 0,
				duration: 0.5,
				stagger: {
					amount: 0.3,
					from: "start",
					ease: "power2.out",
				},
			},
			0
		);

		return openTimeline;
	};

	const close = () => {
		if (isDestroyed) return null;

		if (!isOpen) {
			return null;
		}

		killAllAnimations();

		closeTimeline = gsap.timeline({
			defaults: {
				ease: "power4.out",
				overwrite: "auto",
			},
			onStart: () => {
				isOpen = false;
			},
			onComplete: () => {
				isOpen = false;
				gsap.set(allElements, {
					opacity: 0,
					yPercent: 10,
				});
			},
		});

		closeTimeline.to(
			allElements,
			{
				opacity: 0,
				yPercent: 10,
				duration: 0.4,
			},
			0
		);

		return closeTimeline;
	};

	const destroy = () => {
		if (isDestroyed) return;

		killAllAnimations();
		isDestroyed = true;
		isOpen = false;
	};

	return { open, close, destroy };
}
