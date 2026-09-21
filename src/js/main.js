import "tailwindcss";
import "../css/style.css";

import { initAnimationAccordionSections } from "./animations/animationAccordionSections";
import { initAirParticles } from "./startAirParticles";
import { initAnimationHero } from "./animations/animationHero";
import { initAnimationLogoMaskEffect } from "./animations/animationLogoMaskEffect";
import { initAnimationSidebar } from "./animations/animationSidebar";
import { initAnimationAccordionFaq } from "./animations/animationAccordionFaq";
import { initAnimationStartScrollDown } from "./animations/animationStartScrollDown";
import { initAnimationsSmoothScroll } from "./animations/animationsSmoothScroll";
import {
	initAnimationButtons,
	initAnimateButtonDown,
} from "./animations/animationButtons";
import { initAnimationScenes } from "./animations/animateScences";

import { initCursorSquareDecoration } from "./cursorSquareDecoration";
import { initYandexMap, initYandexMetrika } from "./yandexApp";
import {
	initArtSlider,
	initFoodSlider,
	initFancyboxFoodGallery,
	initFoodFirstHover,
} from "./fancyboxApp";
import { initPopup } from "./popup";
import { initFixedBgOnFreedom } from "./fixedBgOnFreedom";

document.addEventListener("DOMContentLoaded", () => {
	initAnimationAccordionSections(); /* Анимация секций */
	initAirParticles(); /* Пыль */
	initAnimationHero(); /* Анимация главного экрана */
	initAnimationLogoMaskEffect(); /* Анимация логотипа при движении мыши */
	initAnimationAccordionFaq(); /* Анимация аккордеонов ответов на вопросы */
	initAnimationStartScrollDown(); /* Старт анимации скролла вниз */
	initAnimationSidebar(); /* Анимация меню */
	initAnimationsSmoothScroll(); /* Обновление позиции страницы при прокрутке */
	initAnimationButtons(); /* Анимация кнопок */
	initAnimateButtonDown(); /* Анимация кнопки Вниз */
	initAnimationScenes(); /* Параметры сцен */
	initFixedBgOnFreedom(); /* Фикс фоновой картинки в секции О свободе */

	initCursorSquareDecoration(); /* Обводка курсора */

	initArtSlider(); /* Карусель Арт-объекты */
	initFoodSlider(); /* Карусель О еде */
	initFancyboxFoodGallery(); /* Галерея О еде */
	initFoodFirstHover(); /* Анимация наведения на слайды */

	initPopup(); /* Модальное окно */

	initYandexMap(); /* Яндекс Карта */
	initYandexMetrika(); /* Яндекс Метрика */
});
