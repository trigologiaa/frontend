import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export function useDocumentLanguage() {
	const { i18n } = useTranslation();
	useEffect(() => {
		document.documentElement.lang = i18n.resolvedLanguage;
	}, [i18n.resolvedLanguage]);
}
