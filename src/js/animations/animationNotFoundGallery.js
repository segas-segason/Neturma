import { gsap } from "gsap";

const IMAGE_SOURCES = Array.from(
	{ length: 9 },
	(_, index) =>
		`/assets/img/art-object-${String(index + 1).padStart(2, "0")}.webp`
);

const EXCLUDED_TARGETS = [
	"#page-404 h1",
	"#page-404 p",
	"#page-404 a",
	"button",
	"input",
	"textarea",
	"select",
	"[role='button']",
].join(",");

export function initAnimationNotFoundGallery() {
	const page = document.querySelector("#page-404");
	const canAnimate = window.matchMedia(
		"(pointer: fine) and (prefers-reduced-motion: no-preference)"
	).matches;

	if (!page || !canAnimate) return null;

	const layer = document.createElement("div");
	const images = gsap.utils.shuffle([...IMAGE_SOURCES]);
	const activeImages = [];
	let imageIndex = 0;
	let lastPoint = null;
	let lastSpawnTime = 0;

	Object.assign(layer.style, {
		position: "fixed",
		inset: "0",
		overflow: "hidden",
		pointerEvents: "none",
		zIndex: "2",
	});

	Object.assign(page.style, {
		position: "relative",
		zIndex: "3",
	});

	layer.setAttribute("aria-hidden", "true");
	document.body.append(layer);

	images.forEach((src) => {
		const image = new Image();
		image.src = src;
	});

	const removeImage = (image) => {
		const index = activeImages.indexOf(image);

		if (index !== -1) activeImages.splice(index, 1);
		image.remove();
	};

	const showImage = (x, y) => {
		if (activeImages.length >= 7) {
			const oldestImage = activeImages.shift();

			gsap.killTweensOf(oldestImage);
			oldestImage.remove();
		}

		const image = document.createElement("img");
		const width = gsap.utils.random(120, 230, 1);
		const offsetX = gsap.utils.random(-55, 55, 1);
		const startX = gsap.utils.clamp(
			width * 0.55,
			window.innerWidth - width * 0.55,
			x + offsetX
		);
		const startY = gsap.utils.clamp(
			width * 0.4,
			window.innerHeight - width * 0.4,
			y + gsap.utils.random(-30, 30, 1)
		);
		const rotation = gsap.utils.random(-12, 12, 1);

		image.src = images[imageIndex];
		imageIndex = (imageIndex + 1) % images.length;
		image.alt = "";
		image.decoding = "async";

		Object.assign(image.style, {
			position: "absolute",
			left: "0",
			top: "0",
			width: `${width}px`,
			aspectRatio: "4 / 3",
			objectFit: "cover",
			borderRadius: "2px",
			boxShadow: "0 18px 48px rgba(0, 0, 0, 0.28)",
			willChange: "transform, opacity, clip-path",
		});

		layer.append(image);
		activeImages.push(image);

		gsap.timeline({ onComplete: () => removeImage(image) })
			.fromTo(
				image,
				{
					x: startX - width / 2,
					y: startY - width * 0.375 + 32,
					scale: 0.62,
					rotation: rotation - 4,
					autoAlpha: 0,
					clipPath: "inset(48% 0 48% 0)",
				},
				{
					y: startY - width * 0.375,
					scale: 1,
					rotation,
					autoAlpha: 0.92,
					clipPath: "inset(0% 0 0% 0)",
					duration: 0.42,
					ease: "power3.out",
				}
			)
			.to(image, {
				y: `-=${gsap.utils.random(70, 115, 1)}`,
				rotation: rotation + gsap.utils.random(-5, 5, 1),
				scale: 0.94,
				autoAlpha: 0,
				duration: 0.9,
				ease: "power2.in",
			});
	};

	const onPointerMove = (event) => {
		if (
			event.target instanceof Element &&
			event.target.closest(EXCLUDED_TARGETS)
		) {
			lastPoint = null;
			return;
		}

		const point = { x: event.clientX, y: event.clientY };

		if (!lastPoint) {
			lastPoint = point;
			return;
		}

		const distance = Math.hypot(
			point.x - lastPoint.x,
			point.y - lastPoint.y
		);
		const now = performance.now();

		if (distance < 85 || now - lastSpawnTime < 90) return;

		lastPoint = point;
		lastSpawnTime = now;
		showImage(point.x, point.y);
	};

	document.addEventListener("pointermove", onPointerMove, { passive: true });

	return () => {
		document.removeEventListener("pointermove", onPointerMove);
		activeImages.forEach((image) => gsap.killTweensOf(image));
		layer.remove();
	};
}
