import { useTranslation } from "react-i18next";
import { NavItem } from "../../../layout/NavItem";
import { useCart } from "../context/useCart";

export function CartWidget() {
	const { t } = useTranslation();
	const { totalQuantity } = useCart();
	const label =
		totalQuantity > 0
			? t("cart.widget.label", { count: totalQuantity })
			: t("nav.cart");
	return (
		<NavItem to="/carrito" aria-label={label}>
			<svg
				aria-hidden="true"
				focusable="false"
				width="20"
				height="20"
				viewBox="0 0 24 24"
			>
				<path
					d="M3 4h2l2.4 10.2a2 2 0 0 0 2 1.6h7.2a2 2 0 0 0 2-1.5L20 8H6.2"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
				/>
				<circle cx="9" cy="20" r="1.5" />
				<circle cx="17" cy="20" r="1.5" />
			</svg>
			<span>{t("nav.cart")}</span>
			{totalQuantity > 0 && <span>{totalQuantity}</span>}
		</NavItem>
	);
}
