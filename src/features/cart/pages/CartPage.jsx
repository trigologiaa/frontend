import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { formatPrice } from "../../../shared/formatPrice";
import { useLanguage } from "../../../shared/useLanguage";
import { CartItem } from "../components/CartItem";
import { useCart } from "../context/useCart";
import styles from "./CartPage.module.css";

export function CartPage() {
	const { t } = useTranslation();
	const { items, totalPrice, removeFromCart, clearCart } = useCart();
	const language = useLanguage();
	if (items.length === 0) {
		return (
			<section className={styles.empty}>
				<h1 className={styles.title}>{t("nav.cart")}</h1>
				<p>{t("cart.empty")}</p>
				<Link className={styles.browse} to="/servicios">
					{t("cart.browse")}
				</Link>
			</section>
		);
	}
	return (
		<section className={styles.page}>
			<h1 className={styles.title}>{t("nav.cart")}</h1>
			<ul className={styles.list}>
				{items.map((item) => (
					<li key={item.id}>
						<CartItem item={item} onRemove={removeFromCart} />
					</li>
				))}
			</ul>
			<div className={styles.summary}>
				<p className={styles.total} role="status">
					{t("cart.total")}: {formatPrice(totalPrice, language)}
				</p>
				<button className={styles.clear} type="button" onClick={clearCart}>
					{t("cart.clear")}
				</button>
			</div>
		</section>
	);
}
