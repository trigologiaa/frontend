import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { formatPrice } from "../../../shared/formatPrice";
import { CartItem } from "../components/CartItem";
import { useCart } from "../context/useCart";

export function CartPage() {
	const { t, i18n } = useTranslation();
	const { items, totalPrice, removeFromCart, clearCart } = useCart();
	const language = i18n.resolvedLanguage;
	if (items.length === 0) {
		return (
			<>
				<h1>{t("nav.cart")}</h1>
				<p>{t("cart.empty")}</p>
				<Link to="/servicios">{t("cart.browse")}</Link>
			</>
		);
	}
	return (
		<>
			<h1>{t("nav.cart")}</h1>
			<ul>
				{items.map((item) => (
					<li key={item.id}>
						<CartItem item={item} onRemove={removeFromCart} />
					</li>
				))}
			</ul>
			<p role="status">
				{t("cart.total")}: {formatPrice(totalPrice, language)}
			</p>
			<button type="button" onClick={clearCart}>
				{t("cart.clear")}
			</button>
		</>
	);
}
