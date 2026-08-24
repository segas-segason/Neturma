import "tailwindcss";
import "../css/style.css";

import { initAnimationAccordionSections } from "./animations/animationAccordionSections";
import { initAnimationHero } from "./animations/animationHero";
import { initAnimationLogoMaskEffect } from "./animations/animationLogoMaskEffect";
import { initAnimationSidebar } from "./animations/animationSidebar";
import { initAnimationAccordionFaq } from "./animations/animationAccordionFaq";
import { initAnimationVideoScroll } from "./animations/animationParallaxVideoEffect";
import { initAnimationStartScrollDown } from "./animations/animationStartScrollDown";
import { initAnimationPageLenis } from "./animations/animationsPageLenis";
import { initAnimationButtons } from "./animations/animationButtons";
import { initAnimationOpenCloseTrigger } from "./animations/animationOpenCloseTrigger";

import { initCursorSquare } from "./cursorSquare";
import { initMapYandex } from "./mapYandex";
import { initArtSlider, initFoodSlider } from "./fancybox";
import { initPopup } from "./popup";

document.addEventListener("DOMContentLoaded", () => {
	initAnimationAccordionSections(); /* Анимация секций */
	initAnimationHero(); /* Анимация главного экрана */
	initAnimationLogoMaskEffect(); /* Анимация логотипа при движении мыши */
	initAnimationAccordionFaq(); /* Анимация аккордеонов ответов на вопросы */
	initAnimationVideoScroll(); /* Параллакс эффект видео */
	initAnimationStartScrollDown(); /* Старт анимации скролла вниз */
	initAnimationSidebar(); /* Анимация меню */
	initAnimationPageLenis(); /* Обновление позиции страницы при прокрутке */
	initAnimationButtons(); /* Анимация кнопок */
	initAnimationOpenCloseTrigger();

	initCursorSquare(); /* Обводка курсора */
	initMapYandex(); /* Яндекс карта */
	initArtSlider(); /* Карусель Арт-объекты */
	initFoodSlider(); /* Карусель О еде */
	initPopup();
});
