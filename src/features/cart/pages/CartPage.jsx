import { useTranslation } from "react-i18next";

export function CartPage() {
	const { t } = useTranslation();
	return <h1>{t("nav.cart")}</h1>;
}
