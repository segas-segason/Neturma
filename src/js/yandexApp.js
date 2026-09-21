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

export async function initYandexMap() {
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
				autoFitToViewport: "always",
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

export function initYandexMetrika() {
	if (typeof window === "undefined") return;
	if (window.__ymInitialized) return;
	window.__ymInitialized = true;

	(function (m, e, t, r, i, k, a) {
		m[i] =
			m[i] ||
			function () {
				(m[i].a = m[i].a || []).push(arguments);
			};
		m[i].l = 1 * new Date();
		for (var j = 0; j < document.scripts.length; j++) {
			if (document.scripts[j].src === r) {
				return;
			}
		}
		k = e.createElement(t);
		a = e.getElementsByTagName(t)[0];
		k.async = 1;
		k.src = r;
		a.parentNode.insertBefore(k, a);
	})(
		window,
		document,
		"script",
		"https://mc.yandex.ru/metrika/tag.js?id=112671475",
		"ym"
	);

	window.ym(112671475, "init", {
		ssr: true,
		webvisor: true,
		clickmap: true,
		ecommerce: "dataLayer",
		referrer: document.referrer,
		url: location.href,
		accurateTrackBounce: true,
		trackLinks: true,
	});
}
