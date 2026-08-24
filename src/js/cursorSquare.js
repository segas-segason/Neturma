import { gsap } from "gsap";

export function initCursorSquare() {
	const square = document.createElement("div");
	square.classList.add("cursor-square");

	const label = document.createElement("span");
	label.classList.add("cursor-square-label");
	square.append(label);

	document.body.append(square);

	const DEFAULT_SIZE = 36;
	const MENU_SIZE = {
		width: 110,
		height: 40,
		borderRadius: 100,
	};

	gsap.set(square, {
		xPercent: -50,
		yPercent: -50,
		width: DEFAULT_SIZE,
		height: DEFAULT_SIZE,
		borderRadius: "9999px",
	});

	const xTo = gsap.quickTo(square, "x", {
		duration: 0.45,
		ease: "power3.out",
	});

	const yTo = gsap.quickTo(square, "y", {
		duration: 0.45,
		ease: "power3.out",
	});

	window.addEventListener("mousemove", (e) => {
		xTo(e.clientX);
		yTo(e.clientY);
	});

	let isMenuMode = false;
	let currentText = "";

	const getMenuText = (trigger) =>
		trigger.getAttribute("aria-expanded") === "true"
			? "Закрыть"
			: "Открыть";

	const animateSquare = (vars) => {
		gsap.killTweensOf(square, "width,height,borderRadius,scale");

		gsap.to(square, {
			duration: 0.3,
			ease: "power2.out",
			...vars,
		});
	};

	const showLabel = () => {
		gsap.killTweensOf(label, "opacity");

		gsap.to(label, {
			opacity: 1,
			duration: 0.1,
		});
	};

	const hideLabel = () => {
		gsap.killTweensOf(label, "opacity");

		gsap.to(label, {
			opacity: 0,
			duration: 0.1,
		});
	};

	const setMenuText = (text) => {
		if (currentText === text) return;

		const isVisible =
			isMenuMode && Number(gsap.getProperty(label, "opacity")) > 0.1;

		currentText = text;

		if (!isVisible) {
			label.textContent = text;

			if (isMenuMode) {
				showLabel();
			}

			return;
		}

		gsap.killTweensOf(label, "opacity");

		gsap.to(label, {
			opacity: 0,
			duration: 0.12,
			onComplete: () => {
				label.textContent = text;

				gsap.to(label, {
					opacity: 1,
					duration: 0.18,
				});
			},
		});
	};

	const showMenuCursor = (trigger) => {
		const text = getMenuText(trigger);

		if (!isMenuMode) {
			isMenuMode = true;
			currentText = text;
			label.textContent = text;

			animateSquare({
				...MENU_SIZE,
				scale: 1,
			});

			showLabel();

			return;
		}

		setMenuText(text);
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

		const menuTrigger = e.target.closest("#menu-item-trigger");

		if (menuTrigger) {
			showMenuCursor(menuTrigger);
			return;
		}

		const interactive = e.target.closest("a, button");

		resetCursor(Boolean(interactive));
	});

	document.addEventListener("click", (e) => {
		if (!(e.target instanceof Element)) return;

		const menuTrigger = e.target.closest("#menu-item-trigger");

		if (!menuTrigger) return;

		requestAnimationFrame(() => {
			if (menuTrigger.matches(":hover")) {
				showMenuCursor(menuTrigger);
			}
		});
	});

	const menuTrigger = document.querySelector("#menu-item-trigger");

	if (menuTrigger) {
		new MutationObserver(() => {
			if (menuTrigger.matches(":hover")) {
				showMenuCursor(menuTrigger);
			}
		}).observe(menuTrigger, {
			attributes: true,
			attributeFilter: ["aria-expanded", "class"],
		});
	}

	return square;
}
