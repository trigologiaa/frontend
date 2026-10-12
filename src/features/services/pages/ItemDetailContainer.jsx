import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

export function ItemDetailContainer() {
	const { t } = useTranslation();
	const { id } = useParams();
	return (
		<>
			<h1>{t("pages.detail.title")}</h1>
			<p>{id}</p>
		</>
	);
}
