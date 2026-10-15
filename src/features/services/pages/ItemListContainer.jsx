import { useTranslation } from "react-i18next";
import { useServices } from "../hooks/useServices";

export function ItemListContainer() {
	const { t } = useTranslation();
	const { loading } = useServices();
	return (
		<>
			<h1>{t("nav.services")}</h1>
			{loading && <p role="status">{t("catalog.loading")}</p>}
		</>
	);
}
