import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { CartItem } from "../components/CartItem";
import { useCart } from "../context/useCart";

export function CartPage() {
	const { t } = useTranslation();
	const { items, removeFromCart } = useCart();
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
		</>
	);
}
