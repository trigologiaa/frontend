import { useTranslation } from "react-i18next";
import { localized } from "../../../shared/localized";

export function CartItem({ item }) {
	const { t, i18n } = useTranslation();
	const title = localized(item.title, i18n.resolvedLanguage);
	return (
		<article>
			<img src={item.image} alt={title} width="80" height="60" />
			<h3>{title}</h3>
			<p>
				{t("cart.quantity")}: {item.quantity}
			</p>
		</article>
	);
}
