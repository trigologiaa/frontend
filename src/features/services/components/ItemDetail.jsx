import { useTranslation } from "react-i18next";
import { localized } from "../../../shared/localized";

export function ItemDetail({ service }) {
	const { i18n } = useTranslation();
	return (
		<article>
			<h1>{localized(service.title, i18n.resolvedLanguage)}</h1>
		</article>
	);
}
