import { Autoplay, Fancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";
import "@fancyapps/ui/dist/carousel/carousel.autoplay.css";

import { Carousel } from "@fancyapps/ui/dist/carousel/";
import "@fancyapps/ui/dist/carousel/carousel.css";

import { Autoscroll } from "@fancyapps/ui/dist/carousel/carousel.autoscroll.js";

const FOOD_SLIDE_SELECTOR = '.food-slider__slide, [data-fancybox="food-first"]';
const FOOD_FANCYBOX_SELECTOR =
	'[data-fancybox="food-first"], [data-fancybox="food-secondary"]';

const FANCYBOX_ARROW_TEMPLATE = `
	<svg viewBox="0 0 39 36" aria-hidden="true">
		<path d="M19.0508 36L38.1033 0H-0.00177765L19.0508 36Z" />
	</svg>
`;

function getCursorSquare() {
	return document.querySelector(".cursor-square");
}

function getFancyboxDialog(instance) {
	return instance.getContainer()?.closest("dialog");
}

const FANCYBOX_OPTIONS = {
	mainClass: "neturma-fancybox",
	theme: "light",
	zoomEffect: false,
	showClass: "f-fadeIn",
	hideClass: "f-fadeOut",
	fadeEffect: true,
	idle: false,
	on: {
		initLayout: (instance) => {
			const cursor = getCursorSquare();
			const dialog = getFancyboxDialog(instance);

			if (cursor && dialog) dialog.append(cursor);
		},
		destroy: (instance) => {
			const cursor = getCursorSquare();
			const dialog = getFancyboxDialog(instance);

			if (cursor && dialog?.contains(cursor)) document.body.append(cursor);
		},
	},
	l10n: {
		CLOSE: "Закрыть",
		NEXT: "Следующее изображение",
		PREV: "Предыдущее изображение",
		MODAL: "Галерея изображений. Для закрытия нажмите Escape",
	},
	Carousel: {
		transition: "fade",
		Toolbar: {
			display: {
				left: ["counter"],
				right: ["close"],
			},
		},
		Thumbs: false,
		Arrows: {
			prevTpl: FANCYBOX_ARROW_TEMPLATE,
			nextTpl: FANCYBOX_ARROW_TEMPLATE,
		},
	},
};

let currentFoodSlide = null;
let delegationBound = false;

function setActiveFoodSlide(slide) {
	if (slide === currentFoodSlide) return;
	currentFoodSlide?.classList.remove("is-food-active");
	currentFoodSlide = slide;
	slide?.classList.add("is-food-active");
	document.body.classList.toggle("food-hover-active", Boolean(slide));
}

function bindFoodDelegation() {
	if (delegationBound) return;
	delegationBound = true;

	document.addEventListener(
		"mouseover",
		(e) => {
			const slide = e.target?.closest?.(FOOD_SLIDE_SELECTOR);
			if (slide && slide !== currentFoodSlide) setActiveFoodSlide(slide);
		},
		{ passive: true }
	);

	document.addEventListener(
		"mouseout",
		(e) => {
			const slide = e.target?.closest?.(FOOD_SLIDE_SELECTOR);
			if (!slide) return;
			if (slide.contains(e.relatedTarget)) return;
			if (e.relatedTarget?.closest?.(FOOD_SLIDE_SELECTOR)) return;
			setActiveFoodSlide(null);
		},
		{ passive: true }
	);

	document.addEventListener("click", (e) => {
		const link = e.target?.closest?.(FOOD_FANCYBOX_SELECTOR);
		if (!link) return;
		e.preventDefault();

		const links = [...document.querySelectorAll(FOOD_FANCYBOX_SELECTOR)];
		if (!links.length) return;

		Fancybox.show(
			links.map((l) => ({
				src: l.getAttribute("href"),
				type: "image",
				alt: l.querySelector("img")?.alt || "",
			})),
			{
				...FANCYBOX_OPTIONS,
				startIndex: Math.max(0, links.indexOf(link)),
			}
		);
	});
}

function lazyInit(container, callback) {
	const observer = new IntersectionObserver(
		(entries) => {
			if (!entries.some((e) => e.isIntersecting)) return;
			observer.disconnect();
			callback();
		},
		{ threshold: 0.1 }
	);
	observer.observe(container);
}

export function initArtSlider() {
	const container = document.getElementById("carousel-art-objects");
	if (!container) return;

	lazyInit(container, () => {
		const prevBtn = document.querySelector(".carousel-art-prev");
		const nextBtn = document.querySelector(".carousel-art-next");

		const carousel = Carousel(
			container,
			{
				infinite: true,
				Navigation: false,
				Autoscroll: { speedOnHover: 0 },
			},
			{ Autoscroll }
		).init();

		prevBtn?.addEventListener("click", () => carousel.prev());
		nextBtn?.addEventListener("click", () => carousel.next());

		Fancybox.bind('[data-fancybox="art-objects"]', FANCYBOX_OPTIONS);
	});
}

export function initFoodSlider() {
	const container = document.getElementById("carousel-food-secondary");
	if (!container) return;

	lazyInit(container, () => {
		const wrapper = container.parentElement;
		const prevBtn = wrapper.querySelector(".carousel-food-prev");
		const nextBtn = wrapper.querySelector(".carousel-food-next");

		const carousel = Carousel(
			container,
			{
				transition: "slide",
				Navigation: false,
				Autoplay: {
					speedOnHover: 0,
					pauseOnHover: true,
					showProgressbar: false,
				},
			},
			{ Autoplay }
		).init();

		prevBtn?.addEventListener("click", () => carousel.prev());
		nextBtn?.addEventListener("click", () => carousel.next());

		bindFoodDelegation();
	});
}

export function initFoodFirstHover() {
	bindFoodDelegation();
}

export function initFancyboxFoodGallery() {
	bindFoodDelegation();
}
