import { gsap } from "gsap";

const SVG_NS = "http://www.w3.org/2000/svg";

const BALLOON_IMAGES = [
	"/assets/img/balloons/1.png",
	"/assets/img/balloons/2.png",
	"/assets/img/balloons/3.png",
	"/assets/img/balloons/4.png",
	"/assets/img/balloons/5.png",
];

/* ======================= КОНФИГУРАЦИЯ ======================= */

const BASE_CONFIG = {
	COUNT: 12,

	// Физика отталкивания курсором
	INFLUENCE_RADIUS: 200,
	PUSH_STRENGTH: 30,
	SPRING: 0.01,
	DAMPING: 0.6,
	MAX_OFFSET: 260,

	// Геометрия
	BALLOON_SIZE: 620,
	ANCHOR_X: 0.5,
	ANCHOR_Y: 0.95,

	// Нитка
	STRING_SEGMENTS: 9,
	STRING_LENGTH_MIN: 400,
	STRING_LENGTH_MAX: 400,
	STRING_STROKE: 1,

	// Раскладка
	SLOT_JITTER: 8,

	// Коллизии
	COLLISION_RATIO: 1,
	SEPARATION_PADDING: 100,
	SEPARATION_ITERATIONS: 6,
	SEPARATION_RELAX: 0.6,
};

/* ======================= АДАПТИВ ======================= */

const RESPONSIVE_CONFIGS = [
	{
		name: "mobile",
		media: "(max-width: 639px)",
		config: {
			COUNT: 6,
			BALLOON_SIZE: 320,
			INFLUENCE_RADIUS: 0,
			PUSH_STRENGTH: 22,
			MAX_OFFSET: 110,
			STRING_SEGMENTS: 9,
			STRING_LENGTH_MIN: 180,
			STRING_LENGTH_MAX: 180,
			STRING_SEGMENTS: 7,
			SEPARATION_PADDING: 30,
			SEPARATION_ITERATIONS: 4,
			SLOT_JITTER: 12,
		},
	},
	{
		name: "tablet",
		media: "(max-width: 1023px)",
		config: {
			COUNT: 9,
			BALLOON_SIZE: 420,
			INFLUENCE_RADIUS: 0,
			PUSH_STRENGTH: 26,
			MAX_OFFSET: 190,
			STRING_LENGTH_MIN: 280,
			STRING_LENGTH_MAX: 280,
			STRING_SEGMENTS: 8,
			SEPARATION_PADDING: 60,
			SEPARATION_ITERATIONS: 5,
			SLOT_JITTER: 12,
		},
	},
	{
		name: "desktop",
		media: "(min-width: 1024px)",
		config: {
			COUNT: 12,
		},
	},
];

function getBreakpointName() {
	for (const bp of RESPONSIVE_CONFIGS) {
		if (window.matchMedia(bp.media).matches) return bp.name;
	}
	return "desktop";
}

function getPresetConfig() {
	for (const bp of RESPONSIVE_CONFIGS) {
		if (window.matchMedia(bp.media).matches) {
			return { ...BASE_CONFIG, ...bp.config };
		}
	}
	return { ...BASE_CONFIG };
}

function resolveConfig(overrides) {
	return { ...getPresetConfig(), ...(overrides || {}) };
}

/* ======================= СЛОЙ ======================= */

function createLayer() {
	const layer = document.createElement("div");
	layer.id = "balloons-layer";
	layer.setAttribute(
		"style",
		"position:fixed;inset:0;pointer-events:none;overflow:hidden;z-index:100;"
	);

	const svg = document.createElementNS(SVG_NS, "svg");
	svg.setAttribute("width", "100%");
	svg.setAttribute("height", "100%");
	svg.style.cssText =
		"position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:100;overflow:visible;";

	const stringsG = document.createElementNS(SVG_NS, "g");
	svg.appendChild(stringsG);

	const items = document.createElement("div");
	items.style.cssText =
		"position:absolute;inset:0;z-index:2;pointer-events:none;";

	layer.appendChild(svg);
	layer.appendChild(items);
	document.body.appendChild(layer);

	return { layer, stringsG, items };
}

/* ======================= РАСКЛАДКА ПО СЕТКЕ ======================= */

function stratify(count, cfg) {
	const aspect = window.innerWidth / Math.max(1, window.innerHeight);
	const cols = Math.max(1, Math.round(Math.sqrt(count * aspect)));
	const rows = Math.max(1, Math.ceil(count / cols));

	const cells = [];
	for (let r = 0; r < rows; r++) {
		for (let c = 0; c < cols; c++) {
			cells.push({ r, c });
		}
	}

	gsap.utils.shuffle(cells);

	return cells.slice(0, count).map(({ r, c }) => ({
		xVW:
			((c + 0.5) / cols) * 100 +
			gsap.utils.random(-cfg.SLOT_JITTER, cfg.SLOT_JITTER),
		yVH:
			((r + 0.5) / rows) * 100 +
			gsap.utils.random(-cfg.SLOT_JITTER, cfg.SLOT_JITTER),
	}));
}

/* ======================= ОДИН ШАРИК ======================= */

function createBalloon({ items, stringsG, index, xVW, yVH, cfg }) {
	const img = document.createElement("img");
	img.className = "bln__img";
	img.draggable = false;
	img.src = BALLOON_IMAGES[index % BALLOON_IMAGES.length];

	img.style.setProperty("position", "absolute", "important");
	img.style.setProperty("left", "0", "important");
	img.style.setProperty("top", "0", "important");
	img.style.setProperty("width", cfg.BALLOON_SIZE + "px", "important");
	img.style.setProperty("height", cfg.BALLOON_SIZE + "px", "important");
	img.style.setProperty("object-fit", "contain", "important");
	img.style.setProperty("pointer-events", "none", "important");
	img.style.setProperty("user-select", "none", "important");
	img.style.setProperty("will-change", "transform, opacity", "important");
	img.style.setProperty(
		"transform-origin",
		`${cfg.ANCHOR_X * 100}% ${cfg.ANCHOR_Y * 100}%`,
		"important"
	);
	img.style.setProperty("opacity", "0", "important");
	img.style.setProperty("visibility", "hidden", "important");

	const path = document.createElementNS(SVG_NS, "path");
	path.setAttribute("fill", "none");
	path.setAttribute("stroke", "#555");
	path.setAttribute("stroke-width", String(cfg.STRING_STROKE));
	path.setAttribute("stroke-linecap", "round");
	path.setAttribute("stroke-linejoin", "round");
	path.style.opacity = "0";
	path.style.visibility = "hidden";

	items.appendChild(img);
	stringsG.appendChild(path);

	const b = {
		img,
		path,

		xVW,
		restYVH: yVH,
		scaleTo: gsap.utils.random(0.7, 0.9),
		rot: gsap.utils.random(-12, 12),

		px: 0,
		py: 0,
		vx: 0,
		vy: 0,
		tiltAngle: 0,

		avgScale: 1,
		radius: 0,
		centerOffX: 0,
		centerOffY: 0,

		swaySpeed: gsap.utils.random(0.5, 1.1),
		swayPhase: gsap.utils.random(0, Math.PI * 2),
		swayAmount: gsap.utils.random(4, 9),
		stringLength: gsap.utils.random(
			cfg.STRING_LENGTH_MIN,
			cfg.STRING_LENGTH_MAX
		),

		points: [],
		lastAnchor: null,
	};

	for (let i = 0; i <= cfg.STRING_SEGMENTS; i++) {
		b.points.push({ x: 0, y: 0 });
	}

	b.setX = gsap.quickSetter(img, "x", "px");
	b.setY = gsap.quickSetter(img, "y", "px");
	b.setRot = gsap.quickSetter(img, "rotation", "deg");

	gsap.set(img, { x: 0, y: 0, rotation: b.rot });

	return b;
}

/* ======================= ЯКОРЬ ======================= */

function getAnchorFromRect(rect, img, cfg) {
	const cx = rect.left + rect.width / 2;
	const cy = rect.top + rect.height / 2;

	const rotDeg = Number(gsap.getProperty(img, "rotation")) || 0;
	const sx = Number(gsap.getProperty(img, "scaleX")) || 1;
	const sy = Number(gsap.getProperty(img, "scaleY")) || 1;

	const θ = (rotDeg * Math.PI) / 180;

	const offX = (cfg.ANCHOR_X - 0.5) * cfg.BALLOON_SIZE * sx;
	const offY = (cfg.ANCHOR_Y - 0.5) * cfg.BALLOON_SIZE * sy;

	const cos = Math.cos(θ);
	const sin = Math.sin(θ);

	return {
		x: cx + offX * cos - offY * sin,
		y: cy + offX * sin + offY * cos,
	};
}

/* ======================= НИТКА ======================= */

function renderString(b, ax, ay, scale, cfg) {
	const pts = b.points;
	pts[0].x = ax;
	pts[0].y = ay;

	const t = gsap.ticker.time;

	const len = b.stringLength * scale;
	const sway = Math.sin(t * b.swaySpeed + b.swayPhase) * b.swayAmount * scale;

	for (let i = 1; i <= cfg.STRING_SEGMENTS; i++) {
		const f = i / cfg.STRING_SEGMENTS;
		const infl = f * f;

		const inertia = -b.vx * 4 * infl * scale;
		const wave = sway * infl;

		pts[i].x = ax + inertia + wave;
		pts[i].y = ay + len * f + b.vy * 1.5 * infl * scale;
	}

	let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;
	for (let i = 1; i < pts.length - 1; i++) {
		const cur = pts[i];
		const nxt = pts[i + 1];
		const mx = (cur.x + nxt.x) / 2;
		const my = (cur.y + nxt.y) / 2;
		d += ` Q ${cur.x.toFixed(2)} ${cur.y.toFixed(2)} ${mx.toFixed(
			2
		)} ${my.toFixed(2)}`;
	}
	const last = pts[pts.length - 1];
	d += ` T ${last.x.toFixed(2)} ${last.y.toFixed(2)}`;

	b.path.setAttribute("d", d);
}

/* ======================= СБОРКА СЦЕНЫ ======================= */

function buildScene(count, cfg) {
	const { layer, stringsG, items } = createLayer();
	const slots = stratify(count, cfg);

	const balloons = [];
	for (let i = 0; i < count; i++) {
		balloons.push(
			createBalloon({
				items,
				stringsG,
				index: i,
				xVW: slots[i].xVW,
				yVH: slots[i].yVH,
				cfg,
			})
		);
	}

	const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

	const onMouseMove = (e) => {
		mouse.x = e.clientX;
		mouse.y = e.clientY;
	};
	const onTouchMove = (e) => {
		if (e.touches[0]) {
			mouse.x = e.touches[0].clientX;
			mouse.y = e.touches[0].clientY;
		}
	};
	window.addEventListener("mousemove", onMouseMove, { passive: true });
	window.addEventListener("touchmove", onTouchMove, { passive: true });

	const update = () => {
		const vw = window.innerWidth;
		const vh = window.innerHeight;
		const t = gsap.ticker.time;

		/* ПРОХОД 0: радиусы коллизии */
		for (let i = 0; i < balloons.length; i++) {
			const b = balloons[i];

			const opacity = Number(gsap.getProperty(b.img, "opacity")) || 0;
			const sx = Number(gsap.getProperty(b.img, "scaleX")) || 1;
			const sy = Number(gsap.getProperty(b.img, "scaleY")) || 1;
			const s = (sx + sy) / 2;

			b.avgScale = s;

			b.radius =
				opacity < 0.01
					? 0
					: cfg.BALLOON_SIZE * 0.5 * s * cfg.COLLISION_RATIO;

			b.centerOffX = (0.5 - cfg.ANCHOR_X) * cfg.BALLOON_SIZE * s;
			b.centerOffY = (0.5 - cfg.ANCHOR_Y) * cfg.BALLOON_SIZE * s;
		}

		for (let i = 0; i < balloons.length; i++) {
			const b = balloons[i];

			const restX = (b.xVW / 100) * vw;
			const restY = (b.restYVH / 100) * vh;

			const probe = b.lastAnchor || { x: restX + b.px, y: restY + b.py };

			const dx = probe.x - mouse.x;
			const dy = probe.y - mouse.y;
			const dist = Math.hypot(dx, dy) || 1;

			if (dist < cfg.INFLUENCE_RADIUS) {
				const falloff = 1 - dist / cfg.INFLUENCE_RADIUS;
				const force = falloff * falloff * cfg.PUSH_STRENGTH;
				b.vx += (dx / dist) * force;
				b.vy += (dy / dist) * force;
			}

			b.vx -= b.px * cfg.SPRING;
			b.vy -= b.py * cfg.SPRING;
			b.vx *= cfg.DAMPING;
			b.vy *= cfg.DAMPING;

			b.px += b.vx;
			b.py += b.vy;

			b.px = gsap.utils.clamp(-cfg.MAX_OFFSET, cfg.MAX_OFFSET, b.px);
			b.py = gsap.utils.clamp(-cfg.MAX_OFFSET, cfg.MAX_OFFSET, b.py);
		}

		for (let iter = 0; iter < cfg.SEPARATION_ITERATIONS; iter++) {
			for (let i = 0; i < balloons.length; i++) {
				const a = balloons[i];
				if (a.radius <= 0) continue;

				for (let j = i + 1; j < balloons.length; j++) {
					const c = balloons[j];
					if (c.radius <= 0) continue;

					const ax = (a.xVW / 100) * vw + a.px + a.centerOffX;
					const ay = (a.restYVH / 100) * vh + a.py + a.centerOffY;
					const cx = (c.xVW / 100) * vw + c.px + c.centerOffX;
					const cy = (c.restYVH / 100) * vh + c.py + c.centerOffY;

					let ddx = cx - ax;
					let ddy = cy - ay;
					let d = Math.hypot(ddx, ddy);

					const minDist =
						a.radius + c.radius + cfg.SEPARATION_PADDING;
					if (d >= minDist) continue;

					if (d < 0.001) {
						const ang = gsap.utils.random(0, Math.PI * 2);
						ddx = Math.cos(ang);
						ddy = Math.sin(ang);
						d = 1;
					}

					const overlap = (minDist - d) * cfg.SEPARATION_RELAX;
					const nx = ddx / d;
					const ny = ddy / d;
					const push = overlap * 0.5;

					a.px -= nx * push;
					a.py -= ny * push;
					c.px += nx * push;
					c.py += ny * push;
				}
			}
		}

		for (let i = 0; i < balloons.length; i++) {
			const b = balloons[i];
			b.px = gsap.utils.clamp(-cfg.MAX_OFFSET, cfg.MAX_OFFSET, b.px);
			b.py = gsap.utils.clamp(-cfg.MAX_OFFSET, cfg.MAX_OFFSET, b.py);
		}

		for (let i = 0; i < balloons.length; i++) {
			const b = balloons[i];

			const restX = (b.xVW / 100) * vw;
			const restY = (b.restYVH / 100) * vh;

			b.setX(restX + b.px - cfg.BALLOON_SIZE * cfg.ANCHOR_X);
			b.setY(restY + b.py - cfg.BALLOON_SIZE * cfg.ANCHOR_Y);

			const targetTilt =
				Math.sin(t * b.swaySpeed * 0.6 + b.swayPhase) * 1.5 -
				b.vx * 0.25;
			b.tiltAngle += (targetTilt - b.tiltAngle) * 0.1;
			b.setRot(b.rot + b.tiltAngle);
		}

		for (let i = 0; i < balloons.length; i++) {
			const b = balloons[i];

			const opacity = Number(gsap.getProperty(b.img, "opacity")) || 0;
			b.path.style.opacity = String(opacity);

			if (opacity < 0.01) {
				b.path.style.visibility = "hidden";
				b.lastAnchor = null;
				continue;
			}

			const rect = b.img.getBoundingClientRect();
			if (rect.width < 0.5 || rect.height < 0.5) {
				b.path.style.visibility = "hidden";
				b.lastAnchor = null;
				continue;
			}
			b.path.style.visibility = "visible";

			const anchor = getAnchorFromRect(rect, b.img, cfg);
			b.lastAnchor = anchor;
			renderString(b, anchor.x, anchor.y, b.avgScale, cfg);
		}
	};

	gsap.ticker.add(update);
	update();

	const teardown = () => {
		gsap.ticker.remove(update);
		window.removeEventListener("mousemove", onMouseMove);
		window.removeEventListener("touchmove", onTouchMove);
		balloons.forEach((b) => {
			gsap.killTweensOf(b.img);
			b.img.remove();
			b.path.remove();
		});
		layer.remove();
	};

	return {
		balloons,
		elements: balloons.map((b) => b.img),
		teardown,
	};
}

/* ======================= ПУБЛИЧНЫЙ ИНИЦИАТОР ======================= */

export function initBalloons(options = {}) {
	const overrides = {};
	let countBase = null; // эталон для desktop

	if (typeof options === "number") {
		countBase = Math.max(0, Math.floor(options));
	} else {
		for (const k of Object.keys(options)) {
			const v = options[k];
			if (v == null) continue;
			if (k === "COUNT") {
				countBase = Math.max(0, Math.floor(v));
			} else {
				overrides[k] = v;
			}
		}
	}

	const resolveCount = () => {
		const preset = getPresetConfig();
		if (countBase == null) return preset.COUNT;
		const ratio = countBase / BASE_CONFIG.COUNT;
		return Math.max(1, Math.round(preset.COUNT * ratio));
	};

	let currentBp = getBreakpointName();
	let cfg = { ...resolveConfig(overrides), COUNT: resolveCount() };
	let scene = buildScene(cfg.COUNT, cfg);

	const mediaQueries = RESPONSIVE_CONFIGS.map((bp) => {
		const mq = window.matchMedia(bp.media);
		const handler = () => {
			const nextBp = getBreakpointName();
			if (nextBp === currentBp) return;
			currentBp = nextBp;
			rebuild();
		};
		if (mq.addEventListener) mq.addEventListener("change", handler);
		else mq.addListener(handler);
		return { mq, handler };
	});

	const rebuild = () => {
		cfg = { ...resolveConfig(overrides), COUNT: resolveCount() };
		scene.teardown();
		scene = buildScene(cfg.COUNT, cfg);
	};

	return {
		get balloons() {
			return scene.balloons;
		},
		get elements() {
			return scene.elements;
		},
		get count() {
			return cfg.COUNT;
		},
		get breakpoint() {
			return currentBp;
		},

		setCount(n) {
			if (n == null) countBase = null;
			else countBase = Math.max(0, Math.floor(n));
			rebuild();
		},

		refresh(nextOverrides) {
			if (nextOverrides) {
				for (const k of Object.keys(nextOverrides)) {
					const v = nextOverrides[k];
					if (v == null) delete overrides[k];
					else overrides[k] = v;
				}
			}
			rebuild();
		},

		destroy() {
			for (const { mq, handler } of mediaQueries) {
				if (mq.removeEventListener)
					mq.removeEventListener("change", handler);
				else mq.removeListener(handler);
			}
			scene.teardown();
		},
	};
}
