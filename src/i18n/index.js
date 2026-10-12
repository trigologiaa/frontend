import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "./locales/en.json";
import es from "./locales/es.json";

export function createI18n() {
	const instance = i18next.createInstance();
	instance.use(LanguageDetector);
	instance.init({
		resources: {
			es: {
				translation: es,
			},
			en: {
				translation: en,
			},
		},
		fallbackLng: "es",
		interpolation: {
			escapeValue: false,
		},
		initAsync: false,
		supportedLngs: ["es", "en"],
		load: "languageOnly",
		detection: {
			order: ["localStorage", "navigator"],
			caches: ["localStorage"],
		},
	});
	return instance;
}

export const i18n = createI18n();
