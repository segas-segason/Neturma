import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function initAnimationClipScene() {
	const scenes = gsap.utils.toArray(".scene");
	const backgrounds = gsap.utils.toArray(".fixed-bg");


	function updateClip(scene, background) {
		const rect = scene.getBoundingClientRect();

		const top = Math.max(0, rect.top);
		const bottom = Math.max(0, window.innerHeight - rect.bottom);

		gsap.set(background, {
			"--clip-top": `${top}px`,
			"--clip-bottom": `${bottom}px`
		});
	}


	scenes.forEach((scene, index) => {

		const background = backgrounds[index];

		if (!background) return;


		ScrollTrigger.create({
			trigger: scene,

			start: "top bottom",
			end: "bottom top",

			onUpdate: () => {
				updateClip(scene, background);
			},

			onEnter: () => {
				updateClip(scene, background);
			},

			onEnterBack: () => {
				updateClip(scene, background);
			},

			onLeave: () => {
				updateClip(scene, background);
			},

			onLeaveBack: () => {
				updateClip(scene, background);
			}
		});

	});
}