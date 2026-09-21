import { AirParticles } from "./airParticles";

export function initAirParticles() {
	const hero = document.querySelector("#hero");
	const air = document.querySelector("#air");

	if (!hero || !air) return null;

	const dust = new AirParticles(hero);

	dust.init();

	return dust;
}
