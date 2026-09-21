import { gsap } from "gsap";

export function initAnimateAboutVisitContent(panel) {
	if (!panel) {
		return {
			open: () => null,
			close: () => null,
			destroy: () => {},
		};
	}

	const ticketBlock = panel.querySelector("[data-tickets-block]");
	const mapContainer = panel.querySelector("[data-map-block]");
	const faqItems = gsap.utils.toArray(
		panel.querySelectorAll("[data-questions-block]")
	);

	const allElements = [ticketBlock, mapContainer, ...faqItems].filter(
		Boolean
	);

	let openTimeline = null;
	let closeTimeline = null;
	let isDestroyed = false;
	let isAnimating = false;

	const setInitialState = () => {
		gsap.set(allElements, {
			opacity: 0,
			yPercent: 10,
		});
	};

	const getCurrentState = () => {
		if (allElements.length === 0) return "closed";
		const firstEl = allElements[0];
		const opacity = parseFloat(gsap.getProperty(firstEl, "opacity"));
		return opacity > 0.5 ? "open" : "closed";
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
		isAnimating = false;
	};

	const open = () => {
		if (isDestroyed) return null;

		if (isAnimating) {
			killAllAnimations();
		}

		const currentState = getCurrentState();
		if (currentState === "open") {
			if (openTimeline) return openTimeline;
		}

		killAllAnimations();

		setInitialState();

		openTimeline = gsap.timeline({
			defaults: {
				ease: "power2.out",
				overwrite: true,
			},
			onStart: () => {
				isAnimating = true;
			},
			onComplete: () => {
				isAnimating = false;
				gsap.set(allElements, {
					opacity: 1,
					yPercent: 0,
				});
			},
			onInterrupt: () => {
				isAnimating = false;
			},
		});

		openTimeline.to(
			allElements,
			{
				opacity: 1,
				yPercent: 0,
				duration: 0.5,
				stagger: {
					each: 0.1,
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

		if (isAnimating) {
			killAllAnimations();
		}

		const currentState = getCurrentState();
		if (currentState === "closed") {
			return null;
		}

		killAllAnimations();

		closeTimeline = gsap.timeline({
			defaults: {
				ease: "power2.in",
				overwrite: true,
			},
			onStart: () => {
				isAnimating = true;
			},
			onComplete: () => {
				isAnimating = false;
				gsap.set(allElements, {
					opacity: 0,
					yPercent: 10,
				});
			},
			onInterrupt: () => {
				isAnimating = false;
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
		gsap.set(allElements, {
			opacity: 0,
			yPercent: 10,
			clearProps: "all",
		});
		isDestroyed = true;
		isAnimating = false;
	};

	return { open, close, destroy };
}
