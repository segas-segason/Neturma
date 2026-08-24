import { gsap } from "gsap";

import { Fancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";

import { Carousel } from "@fancyapps/ui/dist/carousel/";
import "@fancyapps/ui/dist/carousel/carousel.css";

import "@fancyapps/ui/dist/carousel/carousel.autoplay.css";

import { Autoscroll } from "@fancyapps/ui/dist/carousel/carousel.autoscroll.js";

export function initArtSlider() {
	setTimeout(() => {
		const container = document.getElementById("carousel-art-objects");
		if (!container) return;

		if (
			getComputedStyle(container.closest("#main") || container)
				.display === "none"
		) {
			const checkVisibility = setInterval(() => {
				if (
					getComputedStyle(container.closest("#main") || container)
						.display !== "none"
				) {
					clearInterval(checkVisibility);
					initCarouselLogic();
				}
			}, 100);
		} else {
			initCarouselLogic();
		}

		function initCarouselLogic() {
			const prevBtn = document.querySelector(".carousel-art-prev");
			const nextBtn = document.querySelector(".carousel-art-next");

			const options = {
				slidesPerPage: "auto",
				infinite: true,
				Navigation: false,
			};

			const carousel = Carousel(container, options, {
				Autoscroll,
			}).init();

			if (prevBtn && nextBtn) {
				prevBtn.addEventListener("click", () => {
					carousel.prev();
				});

				nextBtn.addEventListener("click", () => {
					carousel.next();
				});
			}

			Fancybox.bind('[data-fancybox="art-objects"]', {
				zoomEffect: false,
			});

			const slideLinks = container.querySelectorAll(
				"a.art-slider__slide"
			);
			const allImages = container.querySelectorAll(
				".f-carousel__slide img"
			);

			container.addEventListener("mouseleave", () => {
				gsap.to(allImages, {
					filter: "grayscale(0)",
					scale: 1,
					duration: 0.8,
					ease: "back.out",
					overwrite: true,
				});
			});

			slideLinks.forEach((slide) => {
				const img = slide.querySelector("img");
				if (!img) return;

				slide.addEventListener("mouseenter", () => {
					gsap.to(img, {
						filter: "grayscale(0)",
						scale: 1.2,
						duration: 0.8,
						ease: "power4.out",
						overwrite: true,
					});

					allImages.forEach((otherImg) => {
						if (otherImg !== img) {
							gsap.to(otherImg, {
								filter: "grayscale(1)",
								scale: 1,
								duration: 0.5,
								ease: "power2.out",
								overwrite: true,
							});
						}
					});
				});
			});
		}
	}, 100);
}

export function initFoodSlider() {
	const container = document.getElementById("carousel-about-food");
	if (!container) return;

	const wrapper = container.parentElement;
	const prevBtn = wrapper.querySelector(".carousel-food-prev");
	const nextBtn = wrapper.querySelector(".carousel-food-next");

	const options = {
		slidesPerPage: "auto",
		infinite: true,
		Navigation: false,
	};

	const carousel = Carousel(container, options).init();

	if (prevBtn && nextBtn) {
		prevBtn.addEventListener("click", () => carousel.prev());
		nextBtn.addEventListener("click", () => carousel.next());
	}

	Fancybox.bind('[data-fancybox="food"]', {});
}
