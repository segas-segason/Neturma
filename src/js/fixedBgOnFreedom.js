export function initFixedBgOnFreedom() {
	const inner = document.querySelector("[data-freedom-bg-inner]");
	const wrapper = document.querySelector("[data-freedom-bg-wrapper]");
	if (!inner || !wrapper) return;

	if (window.matchMedia("(min-width: 1024px)").matches) {
		inner.style.height = "";
		wrapper.style.height = "";
		return;
	}

	const maxHeight = Math.max(window.innerHeight, window.screen.height);
	const finalHeight = maxHeight + 50;
	inner.style.height = `${finalHeight}px`;
	wrapper.style.height = `${finalHeight}px`;
}
