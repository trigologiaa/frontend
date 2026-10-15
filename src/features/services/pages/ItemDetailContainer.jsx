import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useService } from "../../services/hooks/useService";

export function ItemDetailContainer() {
	const { id } = useParams();
	const { t } = useTranslation();
	const { loading } = useService(id);

	if (loading) return <p role="status">{t("detail.loading")}</p>;
	return null;
}
