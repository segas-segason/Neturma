import { gsap } from "gsap";

export function initCursorSquareDecoration() {
	const isMobileTouch =
		window.matchMedia("(pointer: coarse)").matches &&
		window.matchMedia("(max-width: 767px)").matches;

	if (isMobileTouch) {
		return null;
	}

	const square = document.createElement("div");
	square.classList.add("cursor-square");

	const label = document.createElement("span");
	label.classList.add("cursor-square-label");

	square.append(label);
	document.body.append(square);

	square.style.pointerEvents = "none";

	const iconSvg = `
		<svg viewBox="0 0 39 36" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
			<path
				d="M19.0508 36L38.1033 0H-0.00177765L19.0508 36Z"
				fill="currentColor"
			/>
		</svg>
	`;

	const DEFAULT_SIZE = 16;

	const MENU_SIZE = {
		width: 64,
		height: 64,
		borderRadius: 9999,
	};

	const pressCursor = () => {
		gsap.to(square, {
			scale: 0.6,
			duration: 0.2,
			ease: "power2.out",
			overwrite: "auto",
			onComplete: () => {
				gsap.to(square, {
					scale: 1,
					duration: 0.5,
					ease: "back.out(2)",
					overwrite: "auto",
				});
			},
		});
	};

	gsap.set(square, {
		xPercent: -50,
		yPercent: -50,
		width: DEFAULT_SIZE,
		height: DEFAULT_SIZE,
		borderRadius: 9999,
		scale: 1,
	});

	gsap.set(label, {
		opacity: 0,
		scale: 0,
		rotation: 0,
	});

	const xTo = gsap.quickTo(square, "x", {
		duration: 0.55,
		ease: "power3.out",
	});

	const yTo = gsap.quickTo(square, "y", {
		duration: 0.55,
		ease: "power3.out",
	});

	window.addEventListener("mousemove", (e) => {
		xTo(e.clientX);
		yTo(e.clientY);
	});

	let isMenuMode = false;
	let currentExpandedState = null;

	const setIcon = (isExpanded) => {
		if (!label.querySelector("svg")) {
			label.innerHTML = iconSvg;
		}

		const svg = label.querySelector("svg");

		gsap.set(svg, {
			rotation: isExpanded ? 180 : 0,
		});
	};

	const animateSquare = (vars, duration = 0.55) => {
		gsap.to(square, {
			...vars,
			duration,
			ease: "power3.out",
			overwrite: "auto",
		});
	};

	const showLabel = () => {
		gsap.to(label, {
			opacity: 1,
			scale: 1,
			duration: 0.45,
			ease: "power3.out",
			overwrite: "auto",
		});
	};

	const hideLabel = () => {
		gsap.to(label, {
			opacity: 0,
			scale: 0.7,
			duration: 0.25,
			ease: "power2.out",
			overwrite: "auto",
		});
	};

	const updateMenuIcon = (trigger) => {
		const isExpanded = trigger.getAttribute("aria-expanded") === "true";

		if (currentExpandedState === isExpanded) return;

		const isVisible =
			isMenuMode && Number(gsap.getProperty(label, "opacity")) > 0.1;

		currentExpandedState = isExpanded;

		if (!isVisible) {
			setIcon(isExpanded);

			if (isMenuMode) {
				showLabel();
			}

			return;
		}

		gsap.to(label, {
			opacity: 0,
			scale: 0,
			duration: 0.18,
			ease: "back.out",
			overwrite: "auto",

			onComplete: () => {
				setIcon(isExpanded);

				gsap.to(label, {
					opacity: 1,
					scale: 1,
					duration: 0.4,
					ease: "back.out(1.4)",
					overwrite: "auto",
				});
			},
		});
	};

	const showMenuCursor = (trigger) => {
		const isExpanded = trigger.getAttribute("aria-expanded") === "true";

		if (!isMenuMode) {
			isMenuMode = true;
			currentExpandedState = isExpanded;

			setIcon(isExpanded);

			animateSquare(
				{
					width: MENU_SIZE.width,
					height: MENU_SIZE.height,
					borderRadius: MENU_SIZE.borderRadius,
					scale: 1,
				},
				0.65
			);

			showLabel();

			return;
		}

		updateMenuIcon(trigger);
	};

	const resetCursor = (isInteractive = false) => {
		isMenuMode = false;
		currentExpandedState = null;

		if (isInteractive) {
			animateSquare(
				{
					width: MENU_SIZE.width,
					height: MENU_SIZE.height,
					borderRadius: MENU_SIZE.borderRadius,
					scale: 1,
				},
				0.45
			);
		} else {
			animateSquare(
				{
					width: DEFAULT_SIZE,
					height: DEFAULT_SIZE,
					borderRadius: 9999,
					scale: 1,
				},
				0.65
			);
		}

		hideLabel();
	};

	document.addEventListener("mouseover", (e) => {
		if (!(e.target instanceof Element)) return;

		if (e.target.closest("#menu-item-trigger")) {
			return;
		}

		const interactive = e.target.closest("a, button");

		resetCursor(Boolean(interactive));
	});

	const menuTriggers = document.querySelectorAll("#menu-item-trigger");

	menuTriggers.forEach((trigger) => {
		trigger.addEventListener("mouseenter", () => {
			showMenuCursor(trigger);
		});

		trigger.addEventListener("mouseleave", () => {
			resetCursor(false);
		});

		trigger.addEventListener("click", () => {
			pressCursor();
		});

		new MutationObserver(() => {
			if (trigger.matches(":hover")) {
				showMenuCursor(trigger);
			} else if (isMenuMode) {
				resetCursor(false);
			}
		}).observe(trigger, {
			attributes: true,
			attributeFilter: ["aria-expanded", "class"],
		});
	});

	window.addEventListener("mouseleave", () => {
		resetCursor(false);
	});

	window.addEventListener("blur", () => {
		resetCursor(false);
	});

	return square;
}
