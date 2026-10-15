import { useTranslation } from "react-i18next";
import { ItemList } from "../components/ItemList";
import { useServices } from "../hooks/useServices";

export function ItemListContainer() {
	const { t } = useTranslation();
	const { services, loading } = useServices();
	return (
		<>
			<h1>{t("nav.services")}</h1>
			{loading && <p role="status">{t("catalog.loading")}</p>}
			{!loading && <ItemList services={services} />}
		</>
	);
}
