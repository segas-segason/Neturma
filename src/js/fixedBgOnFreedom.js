export function initFixedBgOnFreedom() {
	const inner = document.querySelector("[data-freedom-bg-inner]");
	const wrapper = document.querySelector("[data-freedom-bg-wrapper]");
	if (!inner || !wrapper) return;

	const desktopViewport = window.matchMedia("(min-width: 1024px)");
	const updateSize = () => {
		const height = desktopViewport.matches ? "" : "calc(100lvh + 50px)";
		inner.style.height = height;
		wrapper.style.height = height;
	};

	updateSize();
	desktopViewport.addEventListener("change", updateSize);
}
