import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

ScrollTrigger.config({
	limitCallbacks: true,
	ignoreMobileResize: true,
});

export function initAnimationSceneBackground(options) {
	const {
		canvasSelector,
		triggerSelector,
		frameCount,
		framePath,
		start = "top top",
		end = "bottom top",
		scrub = 0,
		ease = "power2",
		useWindowSize = true,
		onRender = null,
	} = options;

	const canvas = document.querySelector(canvasSelector);

	if (!canvas) {
		console.warn(`Canvas not found: ${canvasSelector}`);

		return {
			destroy: () => {},
			updateSize: () => {},
			render: () => {},
			refresh: () => {},
			getScrollTrigger: () => null,
		};
	}

	const context = canvas.getContext("2d");

	const images = [];
	const sceneData = {
		frame: 0,
	};

	let scrollTriggerInstance = null;
	let resizeHandler = null;
	let destroyed = false;

	let lastWidth = window.innerWidth;
	let lastHeight = window.innerHeight;
	let lockedMobileHeight = window.innerHeight;

	for (let i = 0; i < frameCount; i++) {
		const img = new Image();

		const indexStr = String(i + 1).padStart(4, "0");

		img.src = framePath.replace(/\{index\}/g, indexStr);

		img.onerror = () => {
			console.warn(`Failed to load frame: ${img.src}`);

			img.src =
				"data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
		};

		images.push(img);
	}

	function render() {
		if (destroyed) return;

		const frameIndex = Math.round(sceneData.frame);
		const img = images[frameIndex];

		if (!img || !img.complete || img.naturalWidth === 0) {
			context.fillStyle = "#1a1a1a";

			context.fillRect(0, 0, canvas.width, canvas.height);

			return;
		}

		context.clearRect(0, 0, canvas.width, canvas.height);

		const canvasRatio = canvas.width / canvas.height;

		const imgRatio = img.width / img.height;

		let sX;
		let sY;
		let sW;
		let sH;

		if (canvasRatio > imgRatio) {
			sW = img.width;
			sH = img.width / canvasRatio;

			sX = 0;
			sY = (img.height - sH) / 2;
		} else {
			sH = img.height;
			sW = img.height * canvasRatio;

			sX = (img.width - sW) / 2;
			sY = 0;
		}

		context.drawImage(
			img,
			sX,
			sY,
			sW,
			sH,
			0,
			0,
			canvas.width,
			canvas.height
		);

		if (typeof onRender === "function") {
			onRender(context, canvas, frameIndex);
		}
	}

	function updateSize() {
		if (destroyed) return;

		const dpr = window.devicePixelRatio || 1;

		let width;
		let height;

		if (useWindowSize) {
			width = window.innerWidth;

			height = Math.max(
				window.innerHeight,
				window.screen.height || window.innerHeight
			);
		} else {
			const rect = canvas.parentElement.getBoundingClientRect();

			width = rect.width;
			height = rect.height;
		}

		canvas.style.width = `${width}px`;
		canvas.style.height = `${height}px`;

		canvas.width = width * dpr;
		canvas.height = height * dpr;

		render();
	}

	function loadAllImages(callback) {
		let loaded = 0;

		if (images.length === 0) {
			callback();
			return;
		}

		const handleLoad = () => {
			loaded++;

			if (loaded === images.length) {
				callback();
			}
		};

		images.forEach((img) => {
			if (img.complete) {
				loaded++;
			} else {
				img.onload = handleLoad;
				img.onerror = handleLoad;
			}
		});

		if (loaded === images.length) {
			callback();
		}
	}

	function createScrollTrigger() {
		if (destroyed) return;

		if (scrollTriggerInstance) {
			scrollTriggerInstance.kill();
			scrollTriggerInstance = null;
		}

		const tween = gsap.to(sceneData, {
			frame: frameCount - 1,

			snap: {
				frame: 1,
			},

			ease,

			scrollTrigger: {
				trigger: triggerSelector,
				start,
				end,
				scrub,
				invalidateOnRefresh: true,
				onUpdate: render,
			},
		});

		scrollTriggerInstance = tween.scrollTrigger;
	}

	function refresh() {
		if (destroyed || !scrollTriggerInstance) {
			return;
		}

		scrollTriggerInstance.refresh();
	}

	loadAllImages(() => {
		if (destroyed) return;

		updateSize();

		createScrollTrigger();

		refresh();
	});

	resizeHandler = () => {
		const currentWidth = window.innerWidth;
		const currentHeight = window.innerHeight;

		const heightDiff = Math.abs(currentHeight - lastHeight);

		if (currentWidth === lastWidth && heightDiff < 150) {
			return;
		}

		lastWidth = currentWidth;
		lastHeight = currentHeight;
		lockedMobileHeight = currentHeight;

		updateSize();
		refresh();
	};

	window.addEventListener("resize", resizeHandler);

	function destroy() {
		if (destroyed) return;

		destroyed = true;

		if (scrollTriggerInstance) {
			scrollTriggerInstance.kill();
			scrollTriggerInstance = null;
		}

		if (resizeHandler) {
			window.removeEventListener("resize", resizeHandler);

			resizeHandler = null;
		}

		images.forEach((img) => {
			img.onload = null;
			img.onerror = null;
			img.src = "";
		});

		images.length = 0;

		context.clearRect(0, 0, canvas.width, canvas.height);
	}

	return {
		destroy,
		updateSize,
		render,
		refresh,
		getScrollTrigger: () => scrollTriggerInstance,
	};
}
