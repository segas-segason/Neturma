const AIR_SETTINGS = {
	quality: "auto",

	profiles: {
		high: {
			count: 300,
			fps: 60,

			mouse: true,
			mouseRadius: 250,
			mouseForce: 0.5,

			drift: true,
			driftStrength: 0.008,
		},

		medium: {
			count: 200,
			fps: 35,

			mouse: true,
			mouseRadius: 220,
			mouseForce: 0.4,

			drift: true,
			driftStrength: 0.006,
		},

		low: {
			count: 100,
			fps: 30,

			mouse: false,
			mouseRadius: 0,
			mouseForce: 0,

			drift: true,
			driftStrength: 0.004,
		},

		off: {
			count: 0,
			fps: 0,

			mouse: false,
			mouseRadius: 0,
			mouseForce: 0,

			drift: false,
			driftStrength: 0,
		},
	},

	profile: {
		far: {
			min: 0.55,
			max: 0.95,
			states: 5,
			speed: 0.018,
		},

		mid: {
			min: 0.3,
			max: 0.95,
			states: 5,
			speed: 0.025,
		},

		near: {
			min: 0.2,
			max: 0.95,
			states: 6,
			speed: 0.035,
		},
	},

	rotationSpeed: {
		far: 0.0015,
		mid: 0.0035,
		near: 0.006,
	},

	color: "#ffffff",

	scrollImpulse: 0.001,

	friction: 0.05,
	maxVelocity: 55,

	maxDpr: 1.5,

	zIndex: 100,

	layers: {
		far: {
			size: 2.2,
			blur: 0.1,
			opacity: 0.18,
			flake: false,
		},

		mid: {
			size: 3.8,
			blur: 0.8,
			opacity: 0.21,
			flake: true,
		},

		near: {
			size: 5.5,
			blur: 2.2,
			opacity: 0.24,
			flake: true,
		},
	},
};

export class AirParticles {
	static detectQuality() {
		const cores = navigator.hardwareConcurrency || 4;
		const memory = navigator.deviceMemory || 0;
		const mobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

		if (cores <= 2) {
			return "low";
		}

		if (memory > 0 && memory <= 2) {
			return "low";
		}

		if (mobile) {
			return cores >= 8 && (memory === 0 || memory >= 8)
				? "medium"
				: "low";
		}

		if (cores >= 8 && (memory === 0 || memory >= 8)) {
			return "high";
		}

		return "medium";
	}

	constructor() {
		const qualityName =
			AIR_SETTINGS.quality === "auto"
				? AirParticles.detectQuality()
				: AIR_SETTINGS.quality;

		const quality =
			AIR_SETTINGS.profiles[qualityName] || AIR_SETTINGS.profiles.medium;

		this.options = {
			...AIR_SETTINGS,
			...quality,
			quality: qualityName,
		};

		this.canvas = null;
		this.ctx = null;

		this.width = 0;
		this.height = 0;

		this.worldWidth = 0;
		this.worldHeight = 0;

		this.dpr = 1;

		this.far = [];
		this.mid = [];
		this.near = [];

		this.scrollDelta = 0;
		this.lastScroll = window.scrollY;

		this.mouse = {
			x: -10000,
			y: -10000,
			vx: 0,
			vy: 0,
			active: false,
		};

		this.mouseSpeed = 0;

		this.sprites = {
			far: [],
			mid: [],
			near: [],
		};

		this.raf = null;
		this.resizeRaf = null;

		this.lastTime = performance.now();
		this.lastFrameTime = 0;

		this.destroyed = false;
	}

	init() {
		if (this.options.count <= 0) return;

		this.createCanvas();

		if (!this.ctx) return;

		this.resize();

		window.addEventListener("resize", this.handleResize);

		window.addEventListener("scroll", this.handleScroll, { passive: true });

		if (this.options.mouse) {
			window.addEventListener("pointermove", this.handlePointerMove, {
				passive: true,
			});

			window.addEventListener("pointerleave", this.handlePointerLeave);
		}

		this.createSprites();
		this.createParticles();

		this.lastTime = performance.now();
		this.lastFrameTime = this.lastTime;

		this.raf = requestAnimationFrame(this.render);
	}

	createCanvas() {
		this.canvas = document.getElementById("air");

		if (!this.canvas) return;

		Object.assign(this.canvas.style, {
			position: "fixed",
			inset: "0",
			width: "100%",
			height: "100%",
			pointerEvents: "none",
			zIndex: this.options.zIndex,
		});

		this.ctx = this.canvas.getContext("2d", {
			alpha: true,
			desynchronized: true,
		});
	}

	resize() {
		const oldWidth = this.width;
		const oldHeight = this.height;

		const newWidth = window.innerWidth;
		const newHeight = window.innerHeight;

		this.width = newWidth;
		this.height = newHeight;

		if (this.worldWidth === 0) {
			this.worldWidth = newWidth;
			this.worldHeight = newHeight;
		}

		const previousWorldWidth = this.worldWidth;
		const previousWorldHeight = this.worldHeight;

		this.worldWidth = Math.max(this.worldWidth, newWidth);

		this.worldHeight = Math.max(this.worldHeight, newHeight);

		this.dpr = Math.min(window.devicePixelRatio || 1, this.options.maxDpr);

		this.canvas.width = Math.round(newWidth * this.dpr);

		this.canvas.height = Math.round(newHeight * this.dpr);

		this.canvas.style.width = `${newWidth}px`;

		this.canvas.style.height = `${newHeight}px`;

		this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

		if (oldWidth > 0 && (newWidth > oldWidth || newHeight > oldHeight)) {
			this.addParticlesForResize(
				oldWidth,
				oldHeight,
				newWidth,
				newHeight,
				previousWorldWidth,
				previousWorldHeight
			);
		}
	}

	createSprites() {
		this.sprites = {
			far: [],
			mid: [],
			near: [],
		};

		const createVariants = (
			baseSize,
			baseBlur,
			baseOpacity,
			flake = false
		) => [
			this.createSprite(
				baseSize * 0.65,
				baseBlur * 0.5,
				baseOpacity * 0.65,
				flake
			),

			this.createSprite(
				baseSize * 0.8,
				baseBlur * 0.7,
				baseOpacity * 0.8,
				flake
			),

			this.createSprite(baseSize, baseBlur, baseOpacity, flake),

			this.createSprite(
				baseSize * 1.12,
				baseBlur * 1.15,
				baseOpacity,
				flake
			),

			this.createSprite(
				baseSize * 1.22,
				baseBlur * 1.3,
				baseOpacity * 0.9,
				flake
			),
		];

		this.sprites.far = createVariants(
			this.options.layers.far.size,
			this.options.layers.far.blur,
			this.options.layers.far.opacity,
			this.options.layers.far.flake
		);

		this.sprites.mid = createVariants(
			this.options.layers.mid.size,
			this.options.layers.mid.blur,
			this.options.layers.mid.opacity,
			this.options.layers.mid.flake
		);

		this.sprites.near = createVariants(
			this.options.layers.near.size,
			this.options.layers.near.blur,
			this.options.layers.near.opacity,
			this.options.layers.near.flake
		);
	}

	createSprite(size, blur, opacity, flake = false) {
		const padding = Math.ceil(blur * 3);

		const diameter = Math.ceil(size * 2 + padding * 2);

		const canvas = document.createElement("canvas");

		canvas.width = diameter;
		canvas.height = diameter;

		const ctx = canvas.getContext("2d");

		ctx.filter = blur > 0 ? `blur(${blur}px)` : "none";

		const cx = diameter / 2;
		const cy = diameter / 2;

		ctx.fillStyle = this.hexToRgba(this.options.color, opacity);

		if (!flake) {
			ctx.beginPath();

			ctx.arc(cx, cy, size, 0, Math.PI * 2);

			ctx.fill();
		} else {
			ctx.beginPath();

			const points = 8;

			for (let i = 0; i < points; i++) {
				const angle = ((Math.PI * 2) / points) * i;

				const random = 0.72 + Math.random() * 0.28;

				const radius = size * random;

				const x = cx + Math.cos(angle) * radius;

				const y = cy + Math.sin(angle) * radius;

				if (i === 0) {
					ctx.moveTo(x, y);
				} else {
					ctx.lineTo(x, y);
				}
			}

			ctx.closePath();
			ctx.fill();

			ctx.beginPath();

			ctx.arc(cx, cy, size * 0.65, 0, Math.PI * 2);

			ctx.fill();
		}

		ctx.filter = "none";

		return {
			canvas,
			width: diameter,
			height: diameter,
		};
	}

	hexToRgba(hex, alpha) {
		const value = hex.replace("#", "");

		const r = parseInt(value.substring(0, 2), 16);

		const g = parseInt(value.substring(2, 4), 16);

		const b = parseInt(value.substring(4, 6), 16);

		return `rgba(${r}, ${g}, ${b}, ${alpha})`;
	}

	createProfileStates(layer) {
		const settings = this.options.profile[layer];
		const states = [];

		for (let i = 0; i < settings.states; i++) {
			states.push(
				settings.min + Math.random() * (settings.max - settings.min)
			);
		}

		for (let i = 1; i < states.length; i++) {
			if (Math.abs(states[i] - states[i - 1]) < 0.12) {
				states[i] = states[i - 1] < 0.55 ? settings.max : settings.min;
			}
		}

		return states;
	}

	createParticle(
		x = Math.random() * this.worldWidth,
		y = Math.random() * this.worldHeight
	) {
		const depth = Math.pow(Math.random(), 2.2);

		let layer;

		if (depth < 0.62) {
			layer = "far";
		} else if (depth < 0.92) {
			layer = "mid";
		} else {
			layer = "near";
		}

		let rotationSpeed = this.options.rotationSpeed[layer];

		rotationSpeed *= 0.65 + Math.random() * 0.7;

		if (Math.random() < 0.5) {
			rotationSpeed *= -1;
		}

		const profileStates = this.createProfileStates(layer);

		return {
			x,
			y,

			depth,

			vx: (Math.random() - 0.5) * 0.35,

			vy: (Math.random() - 0.5) * 0.35,

			driftX: Math.random() * Math.PI * 2,

			driftY: Math.random() * Math.PI * 2,

			driftSpeed: 0.002 + Math.random() * 0.003,

			scrollVariation: 0.82 + Math.random() * 0.36,

			sizeFactor: 0.65 + Math.random() * 0.7,

			opacityFactor: 0.65 + Math.random() * 0.7,

			spriteIndex: Math.floor(Math.random() * 5),

			profileStates,

			profileIndex: Math.floor(
				Math.random() * (profileStates.length - 1)
			),

			profileProgress: Math.random(),

			profile: profileStates[0],

			profileSpeed:
				this.options.profile[layer].speed * (0.7 + Math.random() * 0.6),

			rotation: Math.random() * Math.PI * 2,

			rotationSpeed,

			depthPow18: Math.pow(depth, 1.8),

			depthPow17: Math.pow(depth, 1.7),
		};
	}

	createParticles() {
		this.far = [];
		this.mid = [];
		this.near = [];

		let count = this.options.count;

		if (window.innerWidth < 768) {
			count = Math.min(count, 140);
		}

		for (let i = 0; i < count; i++) {
			this.addParticle(this.createParticle());
		}
	}

	addParticle(particle) {
		if (particle.depth < 0.62) {
			this.far.push(particle);
		} else if (particle.depth < 0.92) {
			this.mid.push(particle);
		} else {
			this.near.push(particle);
		}
	}

	addParticlesForResize(
		oldWidth,
		oldHeight,
		newWidth,
		newHeight,
		oldWorldWidth,
		oldWorldHeight
	) {
		const oldArea = oldWorldWidth * oldWorldHeight;

		const newArea = this.worldWidth * this.worldHeight;

		if (newArea <= oldArea) return;

		const ratio = (newArea - oldArea) / oldArea;

		const currentCount =
			this.far.length + this.mid.length + this.near.length;

		const amount = Math.ceil(currentCount * ratio);

		for (let i = 0; i < amount; i++) {
			let x;
			let y;

			if (newWidth > oldWidth && Math.random() < 0.5) {
				x = oldWidth + Math.random() * (newWidth - oldWidth);

				y = Math.random() * newHeight;
			} else {
				x = Math.random() * newWidth;

				y = oldHeight + Math.random() * (newHeight - oldHeight);
			}

			this.addParticle(this.createParticle(x, y));
		}
	}

	handleScroll = () => {
		const scroll = window.scrollY;

		this.scrollDelta = scroll - this.lastScroll;

		this.lastScroll = scroll;
	};

	handlePointerMove = (event) => {
		const mouse = this.mouse;

		if (mouse.x > -9000) {
			mouse.vx = event.clientX - mouse.x;

			mouse.vy = event.clientY - mouse.y;
		}

		mouse.x = event.clientX;
		mouse.y = event.clientY;

		mouse.active = true;
	};

	handlePointerLeave = () => {
		this.mouse.active = false;

		this.mouse.vx = 0;
		this.mouse.vy = 0;
	};

	updateProfile(p, delta) {
		const states = p.profileStates;
		const count = states.length;

		if (count < 2) return;

		p.profileProgress += p.profileSpeed * delta;

		if (p.profileProgress >= 1) {
			p.profileProgress -= 1;

			p.profileIndex = (p.profileIndex + 1) % count;
		}

		const from = states[p.profileIndex];

		const to = states[(p.profileIndex + 1) % count];

		p.profile = from + (to - from) * p.profileProgress;
	}

	updateParticle(p, delta) {
		if (this.options.drift) {
			p.driftX += p.driftSpeed * delta;

			p.driftY += p.driftSpeed * 0.8 * delta;

			p.vx += Math.sin(p.driftX) * this.options.driftStrength * delta;

			p.vy += Math.cos(p.driftY) * this.options.driftStrength * delta;
		}

		this.updateProfile(p, delta);

		p.rotation += p.rotationSpeed * delta;

		if (Math.abs(this.scrollDelta) > 0.001) {
			const scrollFactor = 0.12 + p.depthPow18 * 0.4;

			const movement =
				-this.scrollDelta * scrollFactor * p.scrollVariation;

			p.y += movement;

			p.vy += movement * this.options.scrollImpulse * 0.7;
		}

		if (this.options.mouse && this.mouse.active) {
			const dx = p.x - this.mouse.x;

			const dy = p.y - this.mouse.y;

			const distanceSq = dx * dx + dy * dy;

			const radius = this.options.mouseRadius;

			const radiusSq = radius * radius;

			if (distanceSq < radiusSq) {
				const distance = Math.sqrt(distanceSq);

				if (distance > 0.1) {
					const influence = 1 - distance / radius;

					const force =
						influence *
						influence *
						p.depthPow17 *
						this.options.mouseForce *
						0.35;

					const nx = dx / distance;

					const ny = dy / distance;

					p.vx += nx * force * this.mouseSpeed;

					p.vy += ny * force * this.mouseSpeed;
				}
			}
		}

		p.x += p.vx * delta;

		p.y += p.vy * delta;

		const frictionDecay = 1 - this.options.friction;

		p.vx *= frictionDecay;
		p.vy *= frictionDecay;

		const speedSq = p.vx * p.vx + p.vy * p.vy;

		const maxVelocity = this.options.maxVelocity;

		const maxVelSq = maxVelocity * maxVelocity;

		if (speedSq > maxVelSq) {
			const scale = Math.sqrt(maxVelSq / speedSq);

			p.vx *= scale;
			p.vy *= scale;
		}

		const margin = 40;

		if (p.x < -margin) {
			p.x = this.worldWidth + margin;
		} else if (p.x > this.worldWidth + margin) {
			p.x = -margin;
		}

		if (p.y < -margin) {
			p.y = this.worldHeight + margin;
		} else if (p.y > this.worldHeight + margin) {
			p.y = -margin;
		}
	}

	drawLayer(particles, sprites) {
		const ctx = this.ctx;

		for (let i = 0, len = particles.length; i < len; i++) {
			const p = particles[i];

			const sprite = sprites[p.spriteIndex];

			const scale = p.sizeFactor;

			const width = sprite.width * scale;

			const height = sprite.height * scale;

			ctx.globalAlpha = p.opacityFactor;

			ctx.drawImage(
				sprite.canvas,

				p.x - width / 2,
				p.y - height / 2,

				width,
				height
			);
		}

		ctx.globalAlpha = 1;
	}

	drawVolumeLayer(particles, sprites) {
		const ctx = this.ctx;
		const dpr = this.dpr;

		for (let i = 0, len = particles.length; i < len; i++) {
			const p = particles[i];

			const sprite = sprites[p.spriteIndex];

			const scale = p.sizeFactor;

			const width = sprite.width * scale;

			const height = sprite.height * scale;

			const profile = p.profile;

			ctx.globalAlpha = p.opacityFactor;

			ctx.setTransform(dpr, 0, 0, dpr, p.x * dpr, p.y * dpr);

			ctx.rotate(p.rotation);

			ctx.scale(1, profile);

			ctx.drawImage(
				sprite.canvas,
				-width / 2,
				-height / 2,
				width,
				height
			);
		}

		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

		ctx.globalAlpha = 1;
	}

	render = (time) => {
		if (this.destroyed) return;

		const targetFps = this.options.fps;

		if (targetFps > 0) {
			this.frameInterval =
				this.options.fps > 0 ? 1000 / this.options.fps : 0;

			if (
				this.frameInterval > 0 &&
				time - this.lastFrameTime < this.frameInterval
			) {
				this.raf = requestAnimationFrame(this.render);
				return;
			}

			this.lastFrameTime = time;
		}

		let delta = (time - this.lastTime) / 16.666;

		if (delta > 2) {
			delta = 2;
		}

		this.lastTime = time;

		this.mouseSpeed =
			this.options.mouse && this.mouse.active
				? Math.min(
						Math.abs(this.mouse.vx) + Math.abs(this.mouse.vy),
						20
					)
				: 0;

		for (let i = 0, len = this.far.length; i < len; i++) {
			this.updateParticle(this.far[i], delta);
		}

		for (let i = 0, len = this.mid.length; i < len; i++) {
			this.updateParticle(this.mid[i], delta);
		}

		for (let i = 0, len = this.near.length; i < len; i++) {
			this.updateParticle(this.near[i], delta);
		}

		this.scrollDelta = 0;

		this.mouse.vx *= 0.75;
		this.mouse.vy *= 0.75;

		this.ctx.clearRect(0, 0, this.width, this.height);

		this.drawLayer(this.far, this.sprites.far);

		this.drawVolumeLayer(this.mid, this.sprites.mid);

		this.drawVolumeLayer(this.near, this.sprites.near);

		this.raf = requestAnimationFrame(this.render);
	};

	handleResize = () => {
		if (this.resizeRaf) return;

		this.resizeRaf = requestAnimationFrame(() => {
			this.resizeRaf = null;
			this.resize();
		});
	};

	destroy() {
		this.destroyed = true;

		if (this.raf) {
			cancelAnimationFrame(this.raf);
		}

		if (this.resizeRaf) {
			cancelAnimationFrame(this.resizeRaf);
		}

		window.removeEventListener("resize", this.handleResize);

		window.removeEventListener("scroll", this.handleScroll);

		window.removeEventListener("pointermove", this.handlePointerMove);

		window.removeEventListener("pointerleave", this.handlePointerLeave);

		if (this.ctx) {
			this.ctx.clearRect(0, 0, this.width, this.height);
		}

		this.far = [];
		this.mid = [];
		this.near = [];

		this.canvas = null;
		this.ctx = null;
	}
}
