import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { ItemDetail } from "../components/ItemDetail";
import { useService } from "../hooks/useService";

export function ItemDetailContainer() {
	const { id } = useParams();
	const { t } = useTranslation();
	const { service, loading, error } = useService(id);

	if (loading) return <p role="status">{t("detail.loading")}</p>;
	if (error) return <p role="alert">{t("detail.error")}</p>;
	if (!service) {
		return (
			<>
				<h1>{t("detail.notFound.title")}</h1>
				<Link to="/servicios">{t("detail.back")}</Link>
			</>
		);
	}
	return (
		<>
			<ItemDetail service={service} />
			<Link to="/servicios">{t("detail.back")}</Link>
		</>
	);
}
