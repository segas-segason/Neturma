import { gsap } from "gsap";

const SVG_NS = "http://www.w3.org/2000/svg";

const BALLOON_IMAGES = [
	"/assets/img/balloons/baloon-01.webp",
	"/assets/img/balloons/baloon-02.webp",
	"/assets/img/balloons/baloon-03.webp",
	"/assets/img/balloons/baloon-04.webp",
	"/assets/img/balloons/baloon-05.webp",
];

/* ======================= КОНФИГУРАЦИЯ ======================= */

const BASE_CONFIG = {
	COUNT: 12,

	INFLUENCE_RADIUS: 0,
	PUSH_STRENGTH: 30,
	SPRING: 0.01,
	DAMPING: 0.6,
	MAX_OFFSET: 260,

	BALLOON_SIZE: 620,
	ANCHOR_X: 0.5,
	ANCHOR_Y: 0.95,

	STRING_SEGMENTS: 24,
	STRING_LENGTH_MIN: 400,
	STRING_LENGTH_MAX: 400,
	STRING_STROKE: 1.5,

	SLOT_JITTER: 8,

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
			COUNT: 9,
			BALLOON_SIZE: 320,
			INFLUENCE_RADIUS: 0,
			PUSH_STRENGTH: 22,
			MAX_OFFSET: 110,
			STRING_LENGTH_MIN: 180,
			STRING_LENGTH_MAX: 180,
			STRING_SEGMENTS: 18,
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
			STRING_SEGMENTS: 18,
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
	document.body.appendChild(layer);
	return { layer };
}

/* ======================= РАСКЛАДКА ======================= */

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

/* ======================= ОДИН ШАРИК + НИТКА ======================= */

function createBalloon({ layer, index, xVW, yVH, cfg }) {
	const wrap = document.createElement("div");
	wrap.className = "bln";
	wrap.style.cssText =
		"position:absolute;inset:0;pointer-events:none;overflow:visible;";

	const svg = document.createElementNS(SVG_NS, "svg");
	svg.setAttribute("width", "100%");
	svg.setAttribute("height", "100%");
	svg.style.cssText =
		"position:absolute;inset:0;width:100%;height:100%;pointer-events:none;overflow:visible;";

	const path = document.createElementNS(SVG_NS, "path");
	path.setAttribute("fill", "none");
	path.setAttribute("stroke", "#555");
	path.setAttribute("stroke-width", String(cfg.STRING_STROKE));
	path.setAttribute("stroke-linecap", "round");
	path.setAttribute("stroke-linejoin", "round");
	path.style.opacity = "0";
	path.style.visibility = "hidden";

	svg.appendChild(path);

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

	wrap.appendChild(svg);
	wrap.appendChild(img);
	layer.appendChild(wrap);

	const b = {
		img,
		path,
		wrap,

		xVW,
		restYVH: yVH,
		scaleTo: gsap.utils.random(0.7, 0.9),
		rot: gsap.utils.random(-8, 8),

		px: 0,
		py: 0,
		vx: 0,
		vy: 0,
		tiltAngle: 0,
		stringBend: 0,
		stringBendVel: 0,
		stringStretch: 0,

		avgScale: 1,
		radius: 0,
		centerOffX: 0,
		centerOffY: 0,

		// --- Естественный дрейф (плавное «дыхание» шарика) ---
		// --- Естественное колыхание ---
		driftSpeedX: gsap.utils.random(0.4, 0.6),
		driftSpeedY: gsap.utils.random(0.2, 0.28),

		driftAmpX: gsap.utils.random(8, 22),
		driftAmpY: gsap.utils.random(3, 9),

		driftPhaseX: gsap.utils.random(0, Math.PI * 2),
		driftPhaseY: gsap.utils.random(0, Math.PI * 2),

		flySwayAmp: gsap.utils.random(10, 30),
		flySwaySpeed: gsap.utils.random(3, 3.8),
		flySwayPhase: gsap.utils.random(0, Math.PI * 2),

		flySwayX: 0, // текущее смещение по X
		flySwayVx: 0, // скорость смещения (для наклона)

		ambientX: 0,
		ambientY: 0,

		ambientVx: 0,
		ambientVy: 0,

		// Физическое состояние
		swayX: 0,
		swayY: 0,

		swayVx: 0,
		swayVy: 0,

		// Инерция наклона
		tiltVelocity: 0,

		swaySpeed: gsap.utils.random(0.1, 0.3),
		swayPhase: gsap.utils.random(0, Math.PI * 2),

		// Очень небольшое колыхание
		swayAmount: gsap.utils.random(10, 20),
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
	const N = pts.length - 1;
	if (N <= 0) return;

	const t = gsap.ticker.time;
	const len = b.stringLength * scale;

	// --- Полная скорость шарика (курсор + дрейф) ---
	const vxTotal = b.vx + b.ambientVx + b.flySwayVx * 8;
	const vyTotal = b.vy + (b.ambientVy || 0);

	// --- Горизонтальный изгиб (пружина с перелётом) ---
	// Шарик вправо → низ влево; шарик влево → низ вправо.
	const targetBend = -vxTotal * 2;

	b.stringBendVel += (targetBend - b.stringBend) * 0.1;

	b.stringBendVel *= 0.91;

	b.stringBend += b.stringBendVel;

	// --- Вертикальное натяжение ---
	// Шарик вверх → нитка визуально длиннее и прямее; вниз → чуть короче.
	const targetStretch = -vyTotal * 0.8;
	b.stringStretch += (targetStretch - b.stringStretch) * 0.2;
	const effectiveLen = len + b.stringStretch;

	// --- При подъёме ветер гасится → нитка становится прямой ---
	const taut = gsap.utils.clamp(0, 1, -vyTotal / 12);
	const windFactor = 1 - taut * 1;

	// --- Параметры ветра ---
	const wt = t * (b.swaySpeed * 0.7) + b.swayPhase;
	const gust = 0.65 + 0.35 * Math.sin(t * 0.31 + b.swayPhase * 0.1);
	const lenFactor = len / 400;
	const windAmp = b.swayAmount * 0.55 * gust * lenFactor * scale * windFactor;

	// Волновое число: сколько "горбов" укладывается по длине нитки.
	// 3.2 — три-четыре изгиба, как у настоящей нитки на ветру.
	const kWave = 20;

	pts[0].x = ax;
	pts[0].y = ay;

	for (let i = 1; i <= N; i++) {
		const f = i / N;

		// Изгиб от скорости: верх почти не гнётся, низ — сильно
		const bendEase = Math.pow(f, 1.5);

		// Бегущая волна вдоль нитки — фаза смещается по длине
		const phase = wt - f * kWave;

		const wave1 = Math.sin(phase) * windAmp;
		const wave2 = Math.sin(phase * 1.7 + 1.3) * windAmp * 0.22;
		const wave3 = Math.sin(phase * 1.7 + 2.1) * windAmp * 0.18;

		// Амплитуда волны растёт к свободному концу
		const waveEase = Math.pow(f, 3);

		// Врождённая кривизна — нитка никогда не бывает прямой палкой
		const innate =
			Math.sin(f * Math.PI * 1.3 + b.swayPhase * 0.5) * windAmp * 0.35;

		pts[i].x =
			ax +
			b.stringBend * bendEase +
			(wave1 + wave2 + wave3) * waveEase +
			innate;

		pts[i].y = ay + effectiveLen * f;
	}

	// --- Гладкая кривая через все точки ---
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
	const { layer } = createLayer();
	const slots = stratify(count, cfg);

	const balloons = [];
	for (let i = 0; i < count; i++) {
		balloons.push(
			createBalloon({
				layer,
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

		/* --- 1. Естественный дрейф шариков --- */
		for (let i = 0; i < balloons.length; i++) {
			const b = balloons[i];

			/*
			 * Медленный поток воздуха.
			 *
			 * Это не движение шарика напрямую.
			 * Это только "ветер", который толкает шарик.
			 */
			const windX =
				Math.sin(t * b.driftSpeedX + b.driftPhaseX) * b.driftAmpX +
				Math.sin(t * b.driftSpeedX * 0.47 + b.driftPhaseX * 1.7) *
					b.driftAmpX *
					3;

			const windY =
				Math.sin(t * b.driftSpeedY + b.driftPhaseY) * b.driftAmpY +
				Math.sin(t * b.driftSpeedY * 0.63 + b.driftPhaseY * 1.4) *
					b.driftAmpY *
					0.3;

			/*
			 * Пружина.
			 *
			 * Шарик стремится к позиции,
			 * но не телепортируется туда.
			 */
			const spring = 0.018;
			const damping = 0.88;

			b.swayVx += (windX - b.swayX) * spring;
			b.swayVy += (windY - b.swayY) * spring;

			b.swayVx *= damping;
			b.swayVy *= damping;

			b.swayX += b.swayVx;
			b.swayY += b.swayVy;

			/*
			 * Плавная скорость движения.
			 * Она понадобится нитке и наклону.
			 */
			b.ambientVx += (b.swayVx - b.ambientVx) * 0.12;
			b.ambientVy += (b.swayVy - b.ambientVy) * 0.12;

			b.ambientX += (b.swayX - b.ambientX) * 0.18;

			b.ambientY += (b.swayY - b.ambientY) * 0.18;

			/*
			 * Летящее колыхание слева-направо.
			 * Две синусоиды с разной частотой — движение не выглядит
			 * механическим маятником, а «дышит».
			 */
			const flyTarget =
				Math.sin(t * b.flySwaySpeed + b.flySwayPhase) * b.flySwayAmp +
				Math.sin(t * b.flySwaySpeed * 0.53 + b.flySwayPhase * 2.1) *
					b.flySwayAmp *
					0.4;

			const prevFlySwayX = b.flySwayX;
			b.flySwayX += (flyTarget - b.flySwayX) * 0.15; // мягкая инерция
			b.flySwayVx = b.flySwayX - prevFlySwayX; // скорость для наклона
		}

		/* --- 2. Пересчёт радиусов/центров --- */
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

		/* --- 3. Физика отталкивания курсором + пружина к покою --- */
		for (let i = 0; i < balloons.length; i++) {
			const b = balloons[i];

			const restX = (b.xVW / 100) * vw + b.ambientX;
			const restY = (b.restYVH / 100) * vh + b.ambientY;

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

		/* --- 4. Разделение шариков (коллизии) --- */
		for (let iter = 0; iter < cfg.SEPARATION_ITERATIONS; iter++) {
			for (let i = 0; i < balloons.length; i++) {
				const a = balloons[i];
				if (a.radius <= 0) continue;

				for (let j = i + 1; j < balloons.length; j++) {
					const c = balloons[j];
					if (c.radius <= 0) continue;

					const ax =
						(a.xVW / 100) * vw + a.px + a.ambientX + a.centerOffX;
					const ay =
						(a.restYVH / 100) * vh +
						a.py +
						a.ambientY +
						a.centerOffY;
					const cx =
						(c.xVW / 100) * vw + c.px + c.ambientX + c.centerOffX;
					const cy =
						(c.restYVH / 100) * vh +
						c.py +
						c.ambientY +
						c.centerOffY;

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

		/* --- 5. Установка позиции + наклон шарика --- */
		for (let i = 0; i < balloons.length; i++) {
			const b = balloons[i];

			const restX = (b.xVW / 100) * vw;
			const restY = (b.restYVH / 100) * vh;

			// Позиция
			b.setX(
				restX +
					b.px +
					b.ambientX +
					b.flySwayX - // ← летящее колыхание по X
					cfg.BALLOON_SIZE * cfg.ANCHOR_X
			);
			b.setY(restY + b.py + b.ambientY - cfg.BALLOON_SIZE * cfg.ANCHOR_Y);

			/*
			 * ==========================================
			 * ДИНАМИЧЕСКОЕ КОЛЫХАНИЕ
			 * ==========================================
			 *
			 * Угол постоянно меняется.
			 * Шарик не получает один постоянный наклон.
			 */

			const naturalSway =
				Math.sin(t * b.swaySpeed + b.swayPhase) * b.swayAmount;

			/*
			 * Медленная вторая волна.
			 * Она делает движение менее механическим.
			 */
			const secondarySway =
				Math.sin(t * b.swaySpeed * 0.43 + b.swayPhase * 1.7) *
				b.swayAmount *
				0.35;

			/*
			 * Реакция на движение.
			 *
			 * Если шарик движется вправо,
			 * его корпус немного отклоняется назад.
			 */
			const velocityTilt = -b.vx * 0.32 - b.ambientVx * 0.6; // ← реакция на летящее колыхание

			const targetTilt = naturalSway + secondarySway + velocityTilt;

			/*
			 * Пружина наклона.
			 *
			 * Здесь важно НЕ делать:
			 *
			 * tiltAngle = targetTilt
			 *
			 * иначе наклон будет меняться слишком резко.
			 */
			const tiltForce = (targetTilt - b.tiltAngle) * 0.02;

			b.tiltVelocity += tiltForce;

			/*
			 * Сопротивление воздуха.
			 */
			b.tiltVelocity *= 0.82;

			/*
			 * Изменяем текущий угол.
			 */
			b.tiltAngle += b.tiltVelocity;

			/*
			 * Ограничиваем угол.
			 */
			b.tiltAngle = gsap.utils.clamp(-2, 2, b.tiltAngle);

			b.setRot(b.tiltAngle);
		}

		/* --- 6. Нитка --- */
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
			b.wrap.remove(); // wrap уносит с собой и img, и path
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
	let countBase = null;

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
