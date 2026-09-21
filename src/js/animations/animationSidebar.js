import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollToPlugin);

const SCROLL_SPACER_ID = "sidebar-scroll-spacer";

function getScrollSpacer() {
	let spacer = document.getElementById(SCROLL_SPACER_ID);
	if (!spacer) {
		spacer = document.createElement("div");
		spacer.id = SCROLL_SPACER_ID;
		spacer.setAttribute("aria-hidden", "true");
		spacer.style.cssText =
			"height:0;pointer-events:none;user-select:none;flex:none;width:0;";
		document.body.appendChild(spacer);
	}
	return spacer;
}

function getDocHeight() {
	return Math.max(
		document.documentElement.scrollHeight,
		document.body.scrollHeight
	);
}

function ensureScrollRoom(sectionEl) {
	const spacer = getScrollSpacer();

	spacer.style.height = "0px";
	void document.body.offsetHeight;

	const targetTop = sectionEl.getBoundingClientRect().top + window.scrollY;
	const needed = targetTop + window.innerHeight - getDocHeight();

	if (needed > 0) {
		spacer.style.height = `${needed + 40}px`;
	}
}

function resetScrollRoom() {
	const spacer = document.getElementById(SCROLL_SPACER_ID);
	if (spacer) spacer.style.height = "0px";
}

function resetScrollRoomIfIdle() {
	const anyOpen = document.querySelector('.menu-item [aria-expanded="true"]');
	if (!anyOpen) resetScrollRoom();
}

function scrollSectionToTop(sectionEl, { duration = 0.2, ease = "slow" } = {}) {
	ensureScrollRoom(sectionEl);

	const targetTop = sectionEl.getBoundingClientRect().top + window.scrollY;

	return gsap.to(window, {
		scrollTo: { y: targetTop, autoKill: true },
		duration,
		ease,
		overwrite: true,
	});
}

const getAccordionTrigger = (section) =>
	section.querySelector(".menu-item-trigger, [id='menu-item-trigger']");

const getAccordionPanel = (section) =>
	section.querySelector(".menu-item-panel, [id='menu-item-panel']");

export function initAnimationSidebar({ navigate } = {}) {
	const sidebar = document.querySelector("#sidebar");
	const logo = document.querySelector("#sidebar-logo");
	const toggle = document.querySelector("#sidebar-toggle");
	const itemMenuText = document.querySelectorAll(".sidebar-link-label");
	const bottom = document.querySelector("#sidebar-btn");

	if (!sidebar || !logo || !toggle || !itemMenuText.length || !bottom) {
		return () => {};
	}

	const lineTop = toggle.querySelector(".l--top");
	const lineMid = toggle.querySelector(".l--mid");
	const lineBot = toggle.querySelector(".l--bot");

	if (!lineTop || !lineMid || !lineBot) {
		return () => {};
	}

	const ac = new AbortController();
	const { signal } = ac;
	const supportsInert = "inert" in HTMLElement.prototype;

	const setInitialState = () => {
		gsap.set(sidebar, { xPercent: 100, opacity: 1 });
		gsap.set(logo, { autoAlpha: 0, yPercent: -100 });
		gsap.set(itemMenuText, { autoAlpha: 0, xPercent: 30 });
		gsap.set(bottom, { autoAlpha: 0, yPercent: 100 });
	};

	const setToggleState = (open) => {
		toggle.setAttribute("aria-expanded", String(open));
		toggle.setAttribute(
			"aria-label",
			open ? "Закрыть меню" : "Открыть меню"
		);
	};

	const setSidebarOpen = (open) => {
		setToggleState(open);
		sidebar.setAttribute("aria-hidden", open ? "false" : "true");
		if (supportsInert) sidebar.inert = !open;
	};

	setInitialState();
	setSidebarOpen(false);

	const tl = gsap.timeline({ paused: true, reversed: true });

	tl.to(sidebar, { xPercent: 0, duration: 0.3, ease: "power2.out" })
	
		.to(
			lineTop,
			{
				attr: { x1: 5, y1: 5, x2: 27, y2: 27 },
				duration: 0.3,
				ease: "power1.out",
			},
			"<"
		)
		.to(
			lineBot,
			{
				attr: { x1: 5, y1: 27, x2: 27, y2: 5 },
				duration: 0.3,
				ease: "power1.out",
			},
			"<"
		)
		.to(lineMid, { autoAlpha: 0, duration: 0.1 }, "<")
		.to(logo, {
			autoAlpha: 1,
			yPercent: 0,
			duration: 0.4,
			ease: "power2.out",
		})
		.to(
			bottom,
			{
				autoAlpha: 1,
				yPercent: 0,
				duration: 0.4,
				ease: "power2.out",
			},
			"<"
		)
		.to(
			itemMenuText,
			{
				autoAlpha: 1,
				xPercent: 0,
				duration: 0.35,
				stagger: 0.06,
				ease: "power2.out",
			},
			"<0.1"
		);

	const openSidebar = (onComplete) => {
		if (onComplete) {
			tl.eventCallback("onComplete", () => {
				tl.eventCallback("onComplete", null);
				onComplete();
			});
		}
		tl.play();
		setSidebarOpen(true);
	};

	const closeSidebar = (onReverseComplete) => {
		if (onReverseComplete) {
			tl.eventCallback("onReverseComplete", () => {
				tl.eventCallback("onReverseComplete", null);
				onReverseComplete();
			});
		}
		tl.reverse();
		setSidebarOpen(false);
	};

	toggle.addEventListener(
		"click",
		() => {
			if (tl.reversed()) openSidebar();
			else closeSidebar();
		},
		{ signal }
	);

	const mm = gsap.matchMedia();
	mm.add("(prefers-reduced-motion: reduce)", () => {
		tl.timeScale(4);
		return () => tl.timeScale(1);
	});

	document.querySelectorAll(".menu-item").forEach((section) => {
		section.addEventListener("menu-item:closed", resetScrollRoomIfIdle, {
			signal,
		});
	});

	const openAccordionFor = (hash, onReady) => {
		const id = hash.startsWith("#") ? hash.slice(1) : hash;
		if (!id) return onReady();

		const targetEl = document.getElementById(id);
		if (!targetEl) return onReady();

		const section = targetEl.closest(".menu-item") || targetEl;
		const trigger = getAccordionTrigger(section);
		const panel = getAccordionPanel(section);

		if (!trigger || !panel) return onReady();

		if (trigger.getAttribute("aria-expanded") === "true") {
			return onReady();
		}

		let done = false;
		let ro = null;
		let fallbackTimer = null;

		const finish = () => {
			if (done) return;
			done = true;
			ro?.disconnect();
			fallbackTimer?.kill();
			section.removeEventListener("menu-item:opened", finish);
			onReady();
		};

		section.addEventListener("menu-item:opened", finish, {
			once: true,
			signal,
		});

		if (typeof ResizeObserver !== "undefined") {
			let stable = 0;
			let lastH = -1;
			ro = new ResizeObserver(() => {
				const h = panel.offsetHeight;
				if (h > 0 && h === lastH) {
					stable++;
					if (stable >= 2) finish();
				} else {
					stable = 0;
					lastH = h;
				}
			});
			ro.observe(panel);
		}

		fallbackTimer = gsap.delayedCall(3, finish);

		trigger.click();
	};

	const SCROLL_START_DELAY = 0.25;
	const SCROLL_DURATION = 1.0;

	sidebar.addEventListener(
		"click",
		(e) => {
			const link = e.target.closest("a[href^='#']");
			if (!link || !sidebar.contains(link)) return;

			e.preventDefault();

			const targetId = link.getAttribute("href");
			if (!targetId || targetId === "#") return;

			const startScroll = () => {
				const id = targetId.slice(1);
				const targetEl = document.getElementById(id);
				if (!targetEl) return;

				const sectionEl = targetEl.closest(".menu-item") || targetEl;
				const trigger = getAccordionTrigger(sectionEl);
				const panel = getAccordionPanel(sectionEl);

				if (!trigger || !panel) {
					if (typeof navigate === "function") navigate(targetId);
					scrollSectionToTop(sectionEl, {
						duration: SCROLL_DURATION,
					});
					return;
				}

				const isOpen = trigger.getAttribute("aria-expanded") === "true";

				if (isOpen) {
					if (typeof navigate === "function") navigate(targetId);
					scrollSectionToTop(sectionEl, {
						duration: SCROLL_DURATION,
					});
					return;
				}

				sectionEl.addEventListener(
					"menu-item:opened",
					() => {
						const top =
							sectionEl.getBoundingClientRect().top +
							window.scrollY;
						if (Math.abs(window.scrollY - top) > 6) {
							scrollSectionToTop(sectionEl, { duration: 0.6 });
						}
					},
					{ once: true, signal }
				);

				trigger.click();

				gsap.delayedCall(SCROLL_START_DELAY, () => {
					if (typeof navigate === "function") navigate(targetId);
					scrollSectionToTop(sectionEl, {
						duration: SCROLL_DURATION,
					});
				});
			};

			const isOpen = !tl.reversed();
			if (isOpen) {
				closeSidebar(startScroll);
			} else {
				startScroll();
			}
		},
		{ signal }
	);

	return () => {
		ac.abort();
		mm.revert();
		tl.kill();
		resetScrollRoom();
		gsap.set(
			[sidebar, logo, itemMenuText, bottom, lineTop, lineMid, lineBot],
			{ clearProps: "all" }
		);
		sidebar.removeAttribute("aria-hidden");
		if (supportsInert) sidebar.inert = false;
	};
}
