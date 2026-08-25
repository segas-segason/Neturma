import gsap from "gsap";

export function initAnimationOpenCloseTrigger() {
	const triggers = document.querySelectorAll('[id="menu-item-trigger"]');
	const panels = document.querySelectorAll('[id="menu-item-panel"]');

	if (triggers.length === 0 || triggers.length !== panels.length) {
		console.warn(
			"Не найдены триггеры или панели, либо их количество не совпадает."
		);
		return;
	}
}
