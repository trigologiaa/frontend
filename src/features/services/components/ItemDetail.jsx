import { useTranslation } from "react-i18next";
import { formatPrice } from "../../../shared/formatPrice";
import { localized } from "../../../shared/localized";

export function ItemDetail({ service }) {
	const { t, i18n } = useTranslation();
	const language = i18n.resolvedLanguage;
	return (
		<article>
			<h1>{localized(service.title, language)}</h1>
			<p>{localized(service.description, language)}</p>
			<p>{t(`categories.${service.category}`)}</p>
			<p>{formatPrice(service.price, language)}</p>
		</article>
	);
}
