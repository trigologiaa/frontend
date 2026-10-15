import { useTranslation } from "react-i18next";
import { localized } from "../../../shared/localized";

export function ItemDetail({ service }) {
	const { i18n } = useTranslation();
	const language = i18n.resolvedLanguage;
	return (
		<article>
			<h1>{localized(service.title, language)}</h1>
			<p>{localized(service.description, language)}</p>
		</article>
	);
}
