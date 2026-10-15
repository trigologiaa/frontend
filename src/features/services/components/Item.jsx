import { useTranslation } from "react-i18next";
import { localized } from "../../../shared/localized";

export function Item({ service }) {
	const { i18n } = useTranslation();
	return (
		<article>
			<h3>{localized(service.title, i18n.resolvedLanguage)}</h3>
		</article>
	);
}
