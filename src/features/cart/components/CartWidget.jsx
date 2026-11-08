import { useTranslation } from "react-i18next";
import { FaCartShopping } from "react-icons/fa6";
import { NavItem } from "../../../layout/NavItem";
import { Icon } from "../../../shared/ui/Icon";
import { useCart } from "../context/useCart";
import styles from "./CartWidget.module.css";

export function CartWidget() {
	const { t } = useTranslation();
	const { totalQuantity } = useCart();
	const label =
		totalQuantity > 0
			? t("cart.widget.label", { count: totalQuantity })
			: t("nav.cart");
	return (
		<NavItem to="/carrito" aria-label={label}>
			<Icon icon={FaCartShopping} className={styles.icon} />
			<span className={styles.label}>{t("nav.cart")}</span>
			{totalQuantity > 0 && (
				<span className={styles.count}>{totalQuantity}</span>
			)}
		</NavItem>
	);
}
