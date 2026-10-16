import { useTranslation } from "react-i18next";

export function useLanguage() {
	const { i18n } = useTranslation();
	return i18n.resolvedLanguage;
}
