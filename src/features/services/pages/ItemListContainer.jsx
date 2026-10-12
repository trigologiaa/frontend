import { useTranslation } from "react-i18next";

export function ItemListContainer() {
  const { t } = useTranslation();
  return <h1>{t("nav.services")}</h1>;
}
