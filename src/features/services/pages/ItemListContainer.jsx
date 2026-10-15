import { useTranslation } from "react-i18next";
import { ItemList } from "../components/ItemList";
import { useServices } from "../hooks/useServices";

export function ItemListContainer() {
	const { t } = useTranslation();
	const { services, loading, error } = useServices();

	let body;
	if (loading) {
		body = <p role="status">{t("catalog.loading")}</p>;
	} else if (error) {
		body = <p role="alert">{t("catalog.error")}</p>;
	} else if (services.length === 0) {
		body = <p>{t("catalog.empty")}</p>;
	} else {
		body = <ItemList services={services} />;
	}

	return (
		<>
			<h1>{t("nav.services")}</h1>
			{body}
		</>
	);
}
