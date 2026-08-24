import gsap from "gsap";

export function initPopup() {
	const modal = document.getElementById("requisites-modal");
	const backdrop = modal.querySelector(".modal-backdrop");
	const content = modal.querySelector(".modal-content");

	function openModal() {
		modal.classList.remove("pointer-events-none");
		modal.setAttribute("aria-hidden", "false");
		document.body.style.overflow = "hidden";

		gsap.timeline()
			.to(modal, { opacity: 1, duration: 0.01 })
			.fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: 0.3 })
			.fromTo(
				content,
				{ y: 50, opacity: 0 },
				{ y: 0, opacity: 1, duration: 0.4, ease: "power3.out" },
				"<"
			);
	}

	function closeModal() {
		gsap.timeline({
			onComplete: () => {
				modal.classList.add("pointer-events-none");
				modal.setAttribute("aria-hidden", "true");
				document.body.style.overflow = "";
				gsap.set(modal, { opacity: 0 });
			},
		})
			.to(content, {
				y: -30,
				opacity: 0,
				duration: 0.25,
				ease: "power2.in",
			})
			.to(backdrop, { opacity: 0, duration: 0.25 }, "<");
	}

	document.addEventListener("click", (e) => {
		if (e.target.closest(".open-requisites-modal")) {
			e.preventDefault();
			openModal();
		}
	});

	modal.querySelector(".modal-close").addEventListener("click", closeModal);
	backdrop.addEventListener("click", closeModal);

	document.addEventListener("keydown", (e) => {
		if (e.key === "Escape" && modal.getAttribute("aria-hidden") === "false")
			closeModal();
	});
}
