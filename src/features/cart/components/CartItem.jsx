import { useTranslation } from "react-i18next";
import { formatPrice } from "../../../shared/formatPrice";
import { localized } from "../../../shared/localized";

export function CartItem({ item }) {
	const { t, i18n } = useTranslation();
	const language = i18n.resolvedLanguage;
	const title = localized(item.title, language);
	return (
		<article>
			<img src={item.image} alt={title} width="80" height="60" />
			<h3>{title}</h3>
			<p>
				{t("cart.quantity")}: {item.quantity}
			</p>
			<p>
				{t("cart.unitPrice")}: {formatPrice(item.price, language)}
			</p>
			<p>
				{t("cart.subtotal")}:{" "}
				{formatPrice(item.price * item.quantity, language)}
			</p>
		</article>
	);
}
