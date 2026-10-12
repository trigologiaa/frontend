import { useTranslation } from "react-i18next";
import { NavItem } from "./NavItem";

export function NavBar() {
  const { t } = useTranslation();
  return (
    <nav aria-label={t("nav.label")}>
      <NavItem to="/">{t("nav.home")}</NavItem>
      <NavItem to="/servicios" activeFor={["/servicio/:id"]}>{t("nav.services")}</NavItem>
      <NavItem to="/carrito">{t("nav.cart")}</NavItem>
    </nav>
  );
}
