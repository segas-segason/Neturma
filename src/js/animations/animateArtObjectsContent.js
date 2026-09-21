import { gsap } from "gsap";

export function initAnimateArtObjectsContent(panel) {
	if (!panel) {
		return {
			open: () => null,
			close: () => null,
			destroy: () => {},
		};
	}

	const textItems = gsap.utils.toArray(panel.querySelectorAll("p"));
	const carousel = panel.querySelector("[data-carousel-art-objects]");

	const allElements = [...textItems, carousel].filter(Boolean);

	let openTimeline = null;
	let closeTimeline = null;
	let isDestroyed = false;
	let isOpen = false;

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
				ease: "power2.in",
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
