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
		mobileScrub = 0.15,
		ease = "power2",
		useWindowSize = true,
		stableTouchViewport = false,
		horizontalPosition = 0.5,
		mobileHorizontalPan = false,
		mobileHorizontalStartPosition = 0,
		progressFromBounds = false,
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
	const trigger = document.querySelector(triggerSelector);

	const images = [];
	const sceneData = {
		frame: 0,
		progress: 0,
	};
	const desktopViewport = window.matchMedia("(min-width: 768px)");

	let scrollTriggerInstance = null;
	let resizeHandler = null;
	let destroyed = false;
	let lastRenderedFrame = null;
	let lastRenderedX = null;
	let lastRenderedY = null;
	let liveProgressInitialized = false;

	let lastWidth = window.innerWidth;
	let lastHeight = window.innerHeight;
	let stableWidth = null;
	let stableHeight = null;

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
			lastRenderedFrame = null;
			context.fillStyle = "#1a1a1a";

			context.fillRect(0, 0, canvas.width, canvas.height);

			return;
		}

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

			const startPosition = Math.min(1, Math.max(0, mobileHorizontalStartPosition));
			const position = mobileHorizontalPan && !desktopViewport.matches
				? startPosition + sceneData.progress * (1 - startPosition)
				: horizontalPosition;

			sX = (img.width - sW) * Math.min(1, Math.max(0, position));
			sY = 0;
		}

		if (
			frameIndex === lastRenderedFrame &&
			sX === lastRenderedX &&
			sY === lastRenderedY &&
			typeof onRender !== "function"
		) {
			return;
		}

		context.clearRect(0, 0, canvas.width, canvas.height);

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

		lastRenderedFrame = frameIndex;
		lastRenderedX = sX;
		lastRenderedY = sY;

		if (typeof onRender === "function") {
			onRender(context, canvas, frameIndex);
		}
	}

	function updateSize() {
		if (destroyed) return;

		const dpr = desktopViewport.matches
			? window.devicePixelRatio || 1
			: Math.min(window.devicePixelRatio || 1, 1.5);

		if (stableTouchViewport && stableWidth !== window.innerWidth) {
			canvas.parentElement.style.height = "";
			canvas.parentElement.style.bottom = "";
		}

		let width;
		let height;

		if (useWindowSize) {
			width = window.innerWidth;

			height = parseFloat(window.getComputedStyle(canvas.parentElement).height)
				|| window.innerHeight;
		} else {
			const rect = canvas.parentElement.getBoundingClientRect();

			width = rect.width;
			height = rect.height;
		}

		if (stableTouchViewport && ScrollTrigger.isTouch === 1 && useWindowSize) {
			if (stableWidth !== width || stableHeight === null) {
				stableWidth = width;
				const screenHeight = window.matchMedia("(orientation: landscape)").matches
					? Math.min(window.screen.width, window.screen.height)
					: Math.max(window.screen.width, window.screen.height);
				stableHeight = Math.max(height, window.innerHeight, screenHeight);
			}
			height = stableHeight;
			canvas.parentElement.style.height = `${height}px`;
			canvas.parentElement.style.bottom = "auto";
		}

		canvas.style.width = `${width}px`;
		canvas.style.height = `${height}px`;

		const pixelWidth = Math.round(width * dpr);
		const pixelHeight = Math.round(height * dpr);

		if (canvas.width === pixelWidth && canvas.height === pixelHeight) {
			return;
		}

		canvas.width = pixelWidth;
		canvas.height = pixelHeight;
		lastRenderedFrame = null;

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
			progress: 1,

			snap: {
				frame: 1,
			},

			ease,
			onUpdate: render,

			scrollTrigger: {
				trigger: triggerSelector,
				start,
				end,
				scrub: desktopViewport.matches ? scrub : mobileScrub,
				onRefresh: (self) => {
					self.animation.totalProgress(self.progress, true);
					render();
				},
			},
		});

		scrollTriggerInstance = tween.scrollTrigger;
	}

	function updateProgressFromBounds(time, deltaTime = 0) {
		if (destroyed || ScrollTrigger.isRefreshing || !trigger) return;

		const rect = trigger.getBoundingClientRect();
		const viewportHeight = window.innerHeight;
		const progress = Math.min(1, Math.max(0,
			(viewportHeight - rect.top) / (viewportHeight + rect.height)
		));
		const duration = desktopViewport.matches ? scrub : mobileScrub;
		const factor = !liveProgressInitialized || !duration
			? 1
			: 1 - Math.exp(-deltaTime / (duration * 1000));

		sceneData.progress += (progress - sceneData.progress) * factor;
		if (Math.abs(progress - sceneData.progress) < 0.0001) {
			sceneData.progress = progress;
		}
		sceneData.frame = sceneData.progress * (frameCount - 1);
		liveProgressInitialized = true;
		render();
	}

	function refresh() {
		if (destroyed) return;
		if (progressFromBounds) {
			updateProgressFromBounds();
			return;
		}
		if (!scrollTriggerInstance) {
			return;
		}

		scrollTriggerInstance.refresh();
	}

	loadAllImages(() => {
		if (destroyed) return;

		updateSize();

		if (progressFromBounds) {
			gsap.ticker.add(updateProgressFromBounds);
		} else {
			createScrollTrigger();
		}

		refresh();
	});

	resizeHandler = () => {
		const currentWidth = window.innerWidth;
		const currentHeight = window.innerHeight;

		if (
			currentWidth === lastWidth &&
			(ScrollTrigger.isTouch === 1 || currentHeight === lastHeight)
		) {
			updateSize();
			return;
		}

		lastWidth = currentWidth;
		lastHeight = currentHeight;

		scrollTriggerInstance?.scrubDuration(
			desktopViewport.matches ? scrub : mobileScrub
		);

		updateSize();
		refresh();
	};

	window.addEventListener("resize", resizeHandler);
	const resizeObserver = new ResizeObserver(updateSize);
	resizeObserver.observe(canvas.parentElement);

	function destroy() {
		if (destroyed) return;

		destroyed = true;
		resizeObserver.disconnect();
		if (progressFromBounds) gsap.ticker.remove(updateProgressFromBounds);

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
