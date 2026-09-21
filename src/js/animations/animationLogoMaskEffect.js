export function initAnimationLogoMaskEffect() {
	const isMobile = window.matchMedia("(max-width: 767px)").matches;

	if (isMobile) return null;

	const wrapper = document.querySelector(".logo-mask-wrapper");
	const overlay = wrapper?.querySelector(".logo-mask-image");
	const hero = document.querySelector("#hero");

	if (!wrapper || !overlay || !hero) return null;

	let rafId = 0;
	let running = false;
	let enabled = false;
	let active = false;

	const pos = { x: 0, y: 0 };
	const target = { x: 0, y: 0 };

	const smooth = 0.1;
	const epsilon = 0.1;

	const render = () => {
		overlay.style.setProperty("--x", `${pos.x}px`);
		overlay.style.setProperty("--y", `${pos.y}px`);
	};

	const getPosition = (clientX, clientY) => {
		const rect = wrapper.getBoundingClientRect();

		return {
			x: clientX - rect.left,
			y: clientY - rect.top,
		};
	};

	const tick = () => {
		const dx = target.x - pos.x;
		const dy = target.y - pos.y;

		if (Math.abs(dx) < epsilon && Math.abs(dy) < epsilon) {
			pos.x = target.x;
			pos.y = target.y;

			render();

			running = false;
			rafId = 0;

			return;
		}

		pos.x += dx * smooth;
		pos.y += dy * smooth;

		render();

		rafId = requestAnimationFrame(tick);
	};

	const start = () => {
		if (running) return;

		running = true;
		rafId = requestAnimationFrame(tick);
	};

	const onPointerMove = (e) => {
		if (!enabled) return;

		const { x, y } = getPosition(e.clientX, e.clientY);

		if (!active) {
			pos.x = target.x = x;
			pos.y = target.y = y;

			render();

			overlay.classList.add("is-active");

			active = true;

			return;
		}

		target.x = x;
		target.y = y;

		start();
	};

	const onPointerLeave = () => {
		if (!enabled) return;

		active = false;

		overlay.classList.remove("is-active");

		if (rafId) {
			cancelAnimationFrame(rafId);
		}

		rafId = 0;
		running = false;
	};

	hero.addEventListener("pointermove", onPointerMove, {
		passive: true,
	});

	hero.addEventListener("pointerleave", onPointerLeave, {
		passive: true,
	});

	const enable = () => {
		enabled = true;
	};

	return enable;
}
