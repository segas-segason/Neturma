function loadYandexMaps() {
	return new Promise((resolve, reject) => {
		if (window.ymaps) {
			resolve(window.ymaps);
			return;
		}

		const script = document.createElement("script");

		script.src =
			"https://api-maps.yandex.ru/2.1/?lang=ru_RU&apikey=307006f6-584d-408e-9f3c-687300b32685";

		script.onload = () => {
			if (window.ymaps) {
				resolve(window.ymaps);
			} else {
				reject(new Error("Yandex Maps API не загрузился"));
			}
		};

		script.onerror = () => {
			reject(new Error("Ошибка загрузки Yandex Maps API"));
		};

		document.head.appendChild(script);
	});
}

export async function initMapYandex() {
	const mapElement = document.querySelector("#map");
	if (!mapElement) return;

	try {
		const ymaps = await loadYandexMaps();
		await ymaps.ready();

		const myMap = new ymaps.Map(
			"map",
			{
				center: [57.791034, 38.46569],
				zoom: 16,
				controls: ["geolocationControl"],
			},
			{
				autoFitToViewport: "always", // Автоматически подстраивать карту при ресайзе
			}
		);

		const myPlacemark = new ymaps.Placemark(
			[57.791034, 38.46569],
			{
				hintContent: "Арт-город НЕТЮРЬМА",
				balloonContentHeader: "НЕТЮРЬМА",
				balloonContentBody:
					"Ярославская область, Мышкин, Никольская улица, 47/2",
			},
			{
				iconLayout: "default#image",
				iconImageHref: "/assets/marker.svg",
				iconImageSize: [57, 78],
				iconImageOffset: [-28, -78],
			}
		);

		myMap.controls.add("zoomControl", {
			size: "small",
			position: { left: 10, bottom: 100 },
		});
		myMap.controls.add("fullscreenControl", {
			float: "none",
			position: { left: 10, bottom: 50 },
		});

		myMap.behaviors.disable("scrollZoom");
		myMap.geoObjects.add(myPlacemark);

		// Принудительно пересчитываем размеры карты при изменении окна
		window.addEventListener("resize", () => {
			myMap.container.fitToViewport();
		});

		const resizeObserver = new ResizeObserver(() => {
			myMap.container.fitToViewport();
		});
		resizeObserver.observe(mapElement);
	} catch (error) {
		console.error("Yandex Maps:", error);
	}
}
