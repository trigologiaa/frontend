import { useTranslation } from "react-i18next";
import { formatPrice } from "../../../shared/formatPrice";
import { localized } from "../../../shared/localized";

export function ItemDetail({ service }) {
	const { t, i18n } = useTranslation();
	const language = i18n.resolvedLanguage;
	const title = localized(service.title, language);
	return (
		<article>
			<img src={service.image} alt={title} width="640" height="400" />
			<h1>{title}</h1>
			<p>{localized(service.description, language)}</p>
			<p>{t(`categories.${service.category}`)}</p>
			<p>{formatPrice(service.price, language)}</p>
		</article>
	);
}
