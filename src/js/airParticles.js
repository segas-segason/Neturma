export class AirParticles {
	static DEFAULTS = {
		quality: "auto",
		maxDpr: 1.5,
		color: "#ffffff",
		scrollImpulse: 0.025,
		maxScrollDelta: 48,
		friction: 0.05,
		maxVelocity: 55,
		mouseRadius: 100,
		mouseForce: 0.5,
		driftStrength: 0.008,
		profiles: {
			high: { count: 150, fps: 60, mouse: true, drift: true },
			medium: { count: 100, fps: 35, mouse: true, drift: true },
			low: { count: 60, fps: 30, mouse: false, drift: true },
			off: { count: 0, fps: 0, mouse: false, drift: false },
		},
		layers: {
			far: { size: 2.2, blur: 0.1, opacity: 0.18, flake: false },
			mid: { size: 3.8, blur: 0.8, opacity: 0.21, flake: true },
			near: { size: 5.5, blur: 2.2, opacity: 0.24, flake: true },
		},
		profile: {
			far: { min: 0.55, max: 0.95, states: 5, speed: 0.018 },
			mid: { min: 0.3, max: 0.95, states: 5, speed: 0.025 },
			near: { min: 0.2, max: 0.95, states: 6, speed: 0.035 },
		},
		rotationSpeed: { far: 0.0015, mid: 0.0035, near: 0.006 },
		mobile: { maxWidth: 767, count: 50, sizeScale: 0.7 },
	};

	static detectQuality() {
		const cores = navigator.hardwareConcurrency || 4;
		const memory = navigator.deviceMemory || 0;
		const mobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
		if (cores <= 2 || (memory > 0 && memory <= 2)) return "low";
		if (mobile)
			return cores >= 8 && (memory === 0 || memory >= 8)
				? "medium"
				: "low";
		return cores >= 8 && (memory === 0 || memory >= 8) ? "high" : "medium";
	}

	constructor() {
		const qualityName =
			AirParticles.DEFAULTS.quality === "auto"
				? AirParticles.detectQuality()
				: AirParticles.DEFAULTS.quality;
		const q =
			AirParticles.DEFAULTS.profiles[qualityName] ||
			AirParticles.DEFAULTS.profiles.medium;

		this.config = {
			...AirParticles.DEFAULTS,
			...q,
			quality: qualityName,
		};

		this.canvas = null;
		this.ctx = null;
		this.width = 0;
		this.height = 0;
		this.dpr = 1;
		this.particles = { far: [], mid: [], near: [] };
		this.sprites = { far: [], mid: [], near: [] };
		this.mouse = { x: -1e4, y: -1e4, vx: 0, vy: 0, active: false };
		this.scrollDelta = 0;
		this.lastScroll = window.scrollY;
		this.raf = null;
		this.lastTime = 0;
		this.lastFrameTime = 0;
		this.frameInterval = 0;
		this.destroyed = false;
		this._resizeRaf = null;

		this._updateParticleBound = this._updateParticle.bind(this);

		this.optParams = {
			drift: false,
			driftStrength: 0,
			mouseEnabled: false,
			mouseRadius: 0,
			mouseForce: 0,
			friction: 0,
			maxVelSq: 0,
			scrollImpulse: 0,
			mouse: null,
			mouseSpeed: 0,
			scrollDelta: 0,
			w: 0,
			h: 0,
		};
	}

	init() {
		if (this.config.count <= 0) return;
		this._createCanvas();
		if (!this.ctx) return;
		this._resize();

		const win = window;
		win.addEventListener("resize", this._onResize);
		win.addEventListener("scroll", this._onScroll, { passive: true });
		if (this.config.mouse) {
			win.addEventListener("pointermove", this._onPointerMove, {
				passive: true,
			});
			win.addEventListener("pointerleave", this._onPointerLeave);
		}

		this._createSprites();
		this._createParticles();
		this.lastTime = performance.now();
		this.lastFrameTime = this.lastTime; // Синхронизация старта
		this.raf = requestAnimationFrame(this._render);
	}

	destroy() {
		this.destroyed = true;
		cancelAnimationFrame(this.raf);
		window.removeEventListener("resize", this._onResize);
		window.removeEventListener("scroll", this._onScroll);
		window.removeEventListener("pointermove", this._onPointerMove);
		window.removeEventListener("pointerleave", this._onPointerLeave);
		if (this.ctx) this.ctx.clearRect(0, 0, this.width, this.height);
		this.particles = { far: [], mid: [], near: [] };
		this.sprites = { far: [], mid: [], near: [] };
		this.canvas = null;
		this.ctx = null;
	}

	_createCanvas() {
		this.canvas = document.getElementById("air");
		if (!this.canvas) return;
		Object.assign(this.canvas.style, {
			position: "fixed",
			inset: "0",
			width: "100%",
			height: "100%",
			pointerEvents: "none",
		});
		this.ctx = this.canvas.getContext("2d", {
			alpha: true,
			desynchronized: true,
		});
	}

	_resize() {
		const w = window.innerWidth,
			h = window.innerHeight;
		this.width = w;
		this.height = h;
		this.dpr = Math.min(devicePixelRatio || 1, this.config.maxDpr);
		const canvas = this.canvas;
		canvas.width = Math.round(w * this.dpr);
		canvas.height = Math.round(h * this.dpr);
		canvas.style.width = w + "px";
		canvas.style.height = h + "px";
		this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
	}

	_createSprites() {
		const isMobile = window.innerWidth <= this.config.mobile.maxWidth;
		const scale = isMobile ? this.config.mobile.sizeScale : 1;
		const color = this.config.color;

		const makeSprite = (size, blur, opacity, flake) => {
			const pad = Math.ceil(blur * 3);
			const diam = Math.ceil(size * 2 + pad * 2);
			const c = document.createElement("canvas");
			c.width = c.height = diam;
			const ctx = c.getContext("2d");
			ctx.filter = blur > 0 ? `blur(${blur}px)` : "none";
			const cx = diam / 2,
				cy = diam / 2;
			ctx.fillStyle = this._hexToRgba(color, opacity);
			if (!flake) {
				ctx.beginPath();
				ctx.arc(cx, cy, size, 0, Math.PI * 2);
				ctx.fill();
			} else {
				ctx.beginPath();
				const pts = 8;
				for (let i = 0; i < pts; i++) {
					const a = ((Math.PI * 2) / pts) * i;
					const r = size * (0.72 + Math.random() * 0.28);
					const x = cx + Math.cos(a) * r,
						y = cy + Math.sin(a) * r;
					i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
				}
				ctx.closePath();
				ctx.fill();
				ctx.beginPath();
				ctx.arc(cx, cy, size * 0.65, 0, Math.PI * 2);
				ctx.fill();
			}
			ctx.filter = "none";
			return { canvas: c, width: diam, height: diam };
		};

		const layers = this.config.layers;
		const variants = (baseSize, baseBlur, baseOpacity, flake) =>
			[0.65, 0.8, 1, 1.12, 1.22].map((f) => {
				const s = baseSize * f * scale;
				const b = baseBlur * f * scale;
				const o = baseOpacity * (f < 1 ? 0.65 + f * 0.35 : 0.9);
				return makeSprite(s, b, o, flake);
			});

		this.sprites.far = variants(
			layers.far.size,
			layers.far.blur,
			layers.far.opacity,
			layers.far.flake
		);
		this.sprites.mid = variants(
			layers.mid.size,
			layers.mid.blur,
			layers.mid.opacity,
			layers.mid.flake
		);
		this.sprites.near = variants(
			layers.near.size,
			layers.near.blur,
			layers.near.opacity,
			layers.near.flake
		);
	}

	_hexToRgba(hex, a) {
		const v = parseInt(hex.slice(1), 16);
		return `rgba(${(v >> 16) & 255}, ${(v >> 8) & 255}, ${v & 255}, ${a})`;
	}

	_createParticles() {
		const isMobile = window.innerWidth <= this.config.mobile.maxWidth;
		const total = isMobile
			? Math.min(this.config.count, this.config.mobile.count)
			: this.config.count;
		const p = { far: [], mid: [], near: [] };
		for (let i = 0; i < total; i++) {
			const particle = this._createParticle();
			if (particle.depth < 0.62) p.far.push(particle);
			else if (particle.depth < 0.92) p.mid.push(particle);
			else p.near.push(particle);
		}
		this.particles = p;
	}

	_createParticle() {
		const depth = Math.pow(Math.random(), 2.2);
		let layer;
		if (depth < 0.62) layer = "far";
		else if (depth < 0.92) layer = "mid";
		else layer = "near";

		const prof = this.config.profile[layer];
		const states = [];
		for (let i = 0; i < prof.states; i++) {
			states.push(prof.min + Math.random() * (prof.max - prof.min));
		}
		for (let i = 1; i < states.length; i++) {
			if (Math.abs(states[i] - states[i - 1]) < 0.12) {
				states[i] = states[i - 1] < 0.55 ? prof.max : prof.min;
			}
		}

		const rotSpeed =
			this.config.rotationSpeed[layer] *
			(0.65 + Math.random() * 0.7) *
			(Math.random() < 0.5 ? -1 : 1);

		return {
			x: Math.random() * this.width,
			y: Math.random() * this.height,
			depth,
			vx: (Math.random() - 0.5) * 0.35,
			vy: (Math.random() - 0.5) * 0.35,
			driftX: Math.random() * Math.PI * 2,
			driftY: Math.random() * Math.PI * 2,
			driftSpeed: 0.002 + Math.random() * 0.003,
			scrollVar: 0.82 + Math.random() * 0.36,
			sizeFactor: 0.65 + Math.random() * 0.7,
			opacityFactor: 0.65 + Math.random() * 0.7,
			spriteIndex: Math.floor(Math.random() * 5),
			states,
			stateIdx: Math.floor(Math.random() * (states.length - 1)),
			stateProgress: Math.random(),
			profile: states[0],
			profileSpeed: prof.speed * (0.7 + Math.random() * 0.6),
			rotation: Math.random() * Math.PI * 2,
			rotationSpeed: rotSpeed,
			depthPow18: Math.pow(depth, 1.8),
			depthPow17: Math.pow(depth, 1.7),
		};
	}

	_updateParticle(p, delta, opt) {
		if (opt.drift) {
			p.driftX += p.driftSpeed * delta;
			p.driftY += p.driftSpeed * 0.8 * delta;
			p.vx += Math.sin(p.driftX) * opt.driftStrength * delta;
			p.vy += Math.cos(p.driftY) * opt.driftStrength * delta;
		}

		const states = p.states;
		if (states.length > 1) {
			p.stateProgress += p.profileSpeed * delta;
			if (p.stateProgress >= 1) {
				p.stateProgress -= 1;
				p.stateIdx = (p.stateIdx + 1) % states.length;
			}
			const from = states[p.stateIdx];
			const to = states[(p.stateIdx + 1) % states.length];
			p.profile = from + (to - from) * p.stateProgress;
		}

		p.rotation += p.rotationSpeed * delta;

		if (Math.abs(opt.scrollDelta) > 0.001) {
			const move =
				-opt.scrollDelta * (0.12 + p.depthPow18 * 0.4) * p.scrollVar;
			p.y += move;
			p.vy += move * opt.scrollImpulse;
		}

		if (opt.mouseEnabled && opt.mouse.active) {
			const dx = p.x - opt.mouse.x;
			const dy = p.y - opt.mouse.y;
			const distSq = dx * dx + dy * dy;
			const radSq = opt.mouseRadius * opt.mouseRadius;

			if (distSq < radSq && distSq > 0.01) {
				const dist = Math.sqrt(distSq);
				const infl = 1 - dist / opt.mouseRadius;
				const depthFactor = 0.35 + p.depthPow17 * 0.65;
				const force = infl * infl * depthFactor * opt.mouseForce;

				const normX = dx / dist;
				const normY = dy / dist;

				// Отталкивание + передача скорости мыши для плавности
				p.vx +=
					(normX * force * 10 + opt.mouse.vx * infl * 0.1) * delta;
				p.vy +=
					(normY * force * 10 + opt.mouse.vy * infl * 0.1) * delta;
			}
		}

		p.x += p.vx * delta;
		p.y += p.vy * delta;

		const fric = Math.pow(1 - opt.friction, delta);
		p.vx *= fric;
		p.vy *= fric;

		const spdSq = p.vx * p.vx + p.vy * p.vy;
		if (spdSq > opt.maxVelSq) {
			const scale = Math.sqrt(opt.maxVelSq / spdSq);
			p.vx *= scale;
			p.vy *= scale;
		}

		const margin = 40;
		if (p.x < -margin) p.x = opt.w + margin;
		else if (p.x > opt.w + margin) p.x = -margin;
		if (p.y < -margin) p.y = opt.h + margin;
		else if (p.y > opt.h + margin) p.y = -margin;
	}

	_render = (time) => {
		if (this.destroyed) return;

		const targetFps = this.config.fps;
		if (targetFps > 0 && targetFps < 60) {
			const interval = 1000 / targetFps;
			const elapsed = time - this.lastFrameTime;
			if (elapsed < interval - 2) {
				this.raf = requestAnimationFrame(this._render);
				return;
			}
			this.lastFrameTime = time - (elapsed % interval);
		} else {
			this.lastFrameTime = time;
		}

		let delta = (time - this.lastTime) / 16.666;
		if (delta > 2) delta = 2;
		this.lastTime = time;

		const mouse = this.mouse;

		// Заполняем существующий объект параметров вместо создания нового
		const opt = this.optParams;
		opt.drift = this.config.drift;
		opt.driftStrength = this.config.driftStrength;
		opt.mouseEnabled = this.config.mouse;
		opt.mouseRadius = this.config.mouseRadius;
		opt.mouseForce = this.config.mouseForce;
		opt.friction = this.config.friction;
		opt.maxVelSq = this.config.maxVelocity * this.config.maxVelocity;
		opt.scrollImpulse = this.config.scrollImpulse;
		opt.mouse = mouse;
		opt.scrollDelta = this.scrollDelta;
		opt.w = this.width;
		opt.h = this.height;

		const upd = this._updateParticleBound;
		const parts = this.particles;
		for (const key of ["far", "mid", "near"]) {
			const arr = parts[key];
			for (let i = 0; i < arr.length; i++) {
				upd(arr[i], delta, opt);
			}
		}

		this.scrollDelta = 0;
		mouse.vx *= 0.75;
		mouse.vy *= 0.75;

		const ctx = this.ctx;
		ctx.clearRect(0, 0, this.width, this.height);

		const sprites = this.sprites;
		const drawLayer = (particles, spriteArr, useProfile) => {
			for (let i = 0; i < particles.length; i++) {
				const p = particles[i];
				const spr = spriteArr[p.spriteIndex];
				const scale = p.sizeFactor;
				const w = spr.width * scale,
					h = spr.height * scale;
				ctx.globalAlpha = p.opacityFactor;
				if (useProfile) {
					ctx.setTransform(
						this.dpr,
						0,
						0,
						this.dpr,
						p.x * this.dpr,
						p.y * this.dpr
					);
					ctx.rotate(p.rotation);
					ctx.scale(1, p.profile);
					ctx.drawImage(spr.canvas, -w / 2, -h / 2, w, h);
				} else {
					ctx.drawImage(spr.canvas, p.x - w / 2, p.y - h / 2, w, h);
				}
			}
		};

		drawLayer(parts.far, sprites.far, false);
		drawLayer(parts.mid, sprites.mid, true);
		drawLayer(parts.near, sprites.near, true);

		ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
		ctx.globalAlpha = 1;

		this.raf = requestAnimationFrame(this._render);
	};

	_onScroll = () => {
		const s = window.scrollY;
		const delta = s - this.lastScroll;
		const limit = this.config.maxScrollDelta;
		this.scrollDelta = Math.max(
			-limit,
			Math.min(limit, this.scrollDelta + delta)
		);
		this.lastScroll = s;
	};

	_onPointerMove = (e) => {
		const m = this.mouse;
		if (m.x > -9000) {
			m.vx = e.clientX - m.x;
			m.vy = e.clientY - m.y;
		}
		m.x = e.clientX;
		m.y = e.clientY;
		m.active = true;
	};

	_onPointerLeave = () => {
		this.mouse.active = false;
		this.mouse.vx = 0;
		this.mouse.vy = 0;
	};

	_onResize = () => {
		if (this._resizeRaf) return;
		this._resizeRaf = requestAnimationFrame(() => {
			this._resizeRaf = null;
			this._resize();
		});
	};
}
