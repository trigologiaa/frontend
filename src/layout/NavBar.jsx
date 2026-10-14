import { useTranslation } from "react-i18next";
import styles from "./NavBar.module.css";
import { NavItem } from "./NavItem";

export function NavBar() {
	const { t } = useTranslation();
	return (
		<nav aria-label={t("nav.label")} className={styles.nav}>
			<NavItem to="/">{t("nav.home")}</NavItem>
			<NavItem to="/servicios" activeFor={["/servicio/:id"]}>
				{t("nav.services")}
			</NavItem>
			<NavItem to="/carrito">{t("nav.cart")}</NavItem>
		</nav>
	);
}
