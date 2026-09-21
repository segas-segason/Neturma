import gsap from "gsap";

export function initPopup() {
	const modal = document.getElementById("requisites-modal");

	if (!modal) return;

	const backdrop = modal.querySelector(".modal-backdrop");
	const content = modal.querySelector(".modal-content");
	const closeButton = modal.querySelector(".modal-close");

	if (!backdrop || !content || !closeButton) return;

	let previousFocusedElement = null;
	let isOpen = false;

	modal.setAttribute("aria-modal", "true");

	function openModal() {
		if (isOpen) return;

		isOpen = true;

		previousFocusedElement = document.activeElement;

		gsap.killTweensOf([modal, backdrop, content]);

		modal.classList.remove("pointer-events-none");
		modal.setAttribute("aria-hidden", "false");

		document.body.style.overflow = "hidden";

		gsap.timeline()
			.set(modal, { opacity: 1 })
			.fromTo(
				backdrop,
				{ opacity: 0 },
				{
					opacity: 1,
					duration: 0.3,
				}
			)
			.fromTo(
				content,
				{
					y: 50,
					opacity: 0,
				},
				{
					y: 0,
					opacity: 1,
					duration: 0.4,
					ease: "power3.out",
				},
				"<"
			)
			.call(() => {
				closeButton.focus();
			});
	}

	function closeModal() {
		if (!isOpen) return;

		isOpen = false;

		gsap.killTweensOf([modal, backdrop, content]);

		gsap.timeline({
			onComplete: () => {
				if (previousFocusedElement instanceof HTMLElement) {
					previousFocusedElement.focus();
				}

				modal.classList.add("pointer-events-none");
				modal.setAttribute("aria-hidden", "true");

				document.body.style.overflow = "";

				gsap.set(modal, { opacity: 0 });
				gsap.set(content, {
					y: 0,
					opacity: 1,
				});
				gsap.set(backdrop, {
					opacity: 1,
				});

				previousFocusedElement = null;
			},
		})
			.to(content, {
				y: -30,
				opacity: 0,
				duration: 0.25,
				ease: "power2.in",
			})
			.to(
				backdrop,
				{
					opacity: 0,
					duration: 0.25,
				},
				"<"
			);
	}

	document.addEventListener("click", (e) => {
		const trigger = e.target.closest(".open-requisites-modal");

		if (!trigger) return;

		e.preventDefault();

		openModal();
	});

	closeButton.addEventListener("click", closeModal);

	backdrop.addEventListener("click", closeModal);

	document.addEventListener("keydown", (e) => {
		if (e.key === "Escape" && isOpen) {
			closeModal();
		}
	});
}
