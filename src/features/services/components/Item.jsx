import { useTranslation } from "react-i18next";
import { localized } from "../../../shared/localized";

export function Item({ service }) {
	const { i18n } = useTranslation();
	const title = localized(service.title, i18n.resolvedLanguage);
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
		</article>
	);
}
