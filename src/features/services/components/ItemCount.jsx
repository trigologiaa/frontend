import { useTranslation } from "react-i18next";

export function ItemCount({ value }) {
	const { t } = useTranslation();
	return <output aria-label={t("detail.quantity")}>{value}</output>;
}
