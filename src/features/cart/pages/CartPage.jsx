import { useTranslation } from "react-i18next";
import { FaTrashCan } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { formatPrice } from "../../../shared/formatPrice";
import { Seo } from "../../../shared/Seo";
import { Button } from "../../../shared/ui/Button";
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
				<Seo
					title={t("seo.cart.title")}
					description={t("seo.cart.description")}
				/>
				<h1 className={styles.title}>{t("nav.cart")}</h1>
				<p>{t("cart.empty")}</p>
				<Button as={Link} to="/servicios" size="lg">
					{t("cart.browse")}
				</Button>
			</section>
		);
	}
	return (
		<section className={styles.page}>
			<Seo
				title={t("seo.cart.title")}
				description={t("seo.cart.description")}
			/>
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
				<Button variant="danger" icon={FaTrashCan} onClick={clearCart}>
					{t("cart.clear")}
				</Button>
				<Button as={Link} to="/checkout" size="lg">
					{t("cart.checkout")}
				</Button>
			</div>
		</section>
	);
}
