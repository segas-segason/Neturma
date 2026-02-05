import "../scss/main.scss";

import { gsap } from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

// Регистрация плагинов
gsap.registerPlugin(ScrollToPlugin);

window.gsap = gsap;

import { initPreloader } from "./preloader.gsap.js";
initPreloader();

import "./sidebar.gsap.js";
import "./menu.gsap.js";