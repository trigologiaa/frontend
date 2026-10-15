import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { ItemDetail } from "../components/ItemDetail";
import { useService } from "../hooks/useService";

export function ItemDetailContainer() {
	const { id } = useParams();
	const { t } = useTranslation();
	const { service, loading } = useService(id);

	if (loading) return <p role="status">{t("detail.loading")}</p>;
	return <ItemDetail service={service} />;
}
