import { AirParticles } from "./airParticles";

export function initAirParticles() {
	const air = document.querySelector("#air");

	if (!air) return null;

	const dust = new AirParticles();

	dust.init();

	return dust;
}
