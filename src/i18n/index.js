import i18next from "i18next";
import en from "./locales/en.json";
import es from "./locales/es.json";

export function createI18n() {
	const instance = i18next.createInstance();
	instance.init({
		resources: {
			es: {
				translation: es,
			},
			en: {
				translation: en,
			},
		},
		lng: "es",
		fallbackLng: "es",
		interpolation: {
			escapeValue: false,
		},
		initAsync: false,
	});
	return instance;
}
