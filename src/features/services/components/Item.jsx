import { useTranslation } from "react-i18next";
import { formatPrice } from "../../../shared/formatPrice";
import { localized } from "../../../shared/localized";

export function Item({ service }) {
	const { t, i18n } = useTranslation();
	const language = i18n.resolvedLanguage;
	const title = localized(service.title, language);
	return (
		<article>
			<img
				src={service.image}
				alt={title}
				loading="lazy"
				width="320"
				height="200"
			/>
			<h3>{title}</h3>
			<p>{t(`categories.${service.category}`)}</p>
			<p>{formatPrice(service.price, language)}</p>
		</article>
	);
}
