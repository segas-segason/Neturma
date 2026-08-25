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
			<path d="M19.0508 36L38.1033 0H-0.00177765L19.0508 36Z" fill="currentColor" />
		</svg>
	`;

	const DEFAULT_SIZE = 36;
	const MENU_SIZE = { width: 64, height: 64, borderRadius: 100 };

	gsap.set(square, {
		xPercent: -50,
		yPercent: -50,
		width: DEFAULT_SIZE,
		height: DEFAULT_SIZE,
		borderRadius: "9999px",
	});

	const xTo = gsap.quickTo(square, "x", {
		duration: 0.6,
		ease: "power3.out",
	});
	const yTo = gsap.quickTo(square, "y", {
		duration: 0.6,
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
		gsap.to(svg, {
			rotation: isExpanded ? 180 : 0,
			duration: 0.6,
			ease: "power2.out",
			transformOrigin: "50% 50%",
		});
	};

	const animateSquare = (vars) => {
		gsap.killTweensOf(square, "width,height,borderRadius,scale");
		gsap.to(square, { duration: 0.3, ease: "power2.out", ...vars });
	};

	const showLabel = () => gsap.to(label, { opacity: 1, duration: 0.1 });
	const hideLabel = () => {
		gsap.killTweensOf(label, "opacity");
		gsap.set(label, { opacity: 0 });
	};

	const updateMenuIcon = (trigger) => {
		const isExpanded = trigger.getAttribute("aria-expanded") === "true";
		if (currentExpandedState === isExpanded) return;

		const isVisible =
			isMenuMode && Number(gsap.getProperty(label, "opacity")) > 0.1;
		currentExpandedState = isExpanded;

		if (!isVisible) {
			setIcon(isExpanded);
			if (isMenuMode) showLabel();
			return;
		}

		gsap.to(label, {
			opacity: 0,
			duration: 0.2,
			onComplete: () => {
				setIcon(isExpanded);
				gsap.to(label, { opacity: 1, duration: 0.4 });
			},
		});
	};

	const showMenuCursor = (trigger) => {
		if (!isMenuMode) {
			isMenuMode = true;
			currentExpandedState =
				trigger.getAttribute("aria-expanded") === "true";
			setIcon(currentExpandedState);

			animateSquare({ ...MENU_SIZE, scale: 1 });
			showLabel();
			return;
		}

		updateMenuIcon(trigger);
	};

	const resetCursor = (isInteractive = false) => {
		isMenuMode = false;
		animateSquare({
			width: DEFAULT_SIZE,
			height: DEFAULT_SIZE,
			borderRadius: "9999px",
			scale: isInteractive ? 0.4 : 1,
		});
		hideLabel();
	};

	document.addEventListener("mouseover", (e) => {
		if (!(e.target instanceof Element)) return;

		if (e.target.closest("#menu-item-trigger")) return;

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

	window.addEventListener("mouseleave", () => resetCursor(false));

	window.addEventListener("blur", () => resetCursor(false));

	return square;
}
