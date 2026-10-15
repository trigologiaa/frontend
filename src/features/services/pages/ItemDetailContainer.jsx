import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { ItemDetail } from "../components/ItemDetail";
import { useService } from "../hooks/useService";
import styles from "./ItemDetailContainer.module.css";

export function ItemDetailContainer() {
	const { id } = useParams();
	const { t } = useTranslation();
	const { service, loading, error } = useService(id);

	if (loading) {
		return (
			<p className={styles.status} role="status">
				{t("detail.loading")}
			</p>
		);
	}
	if (error) {
		return (
			<p className={styles.alert} role="alert">
				{t("detail.error")}
			</p>
		);
	}
	if (!service) {
		return (
			<section className={styles.notFound}>
				<h1 className={styles.notFoundTitle}>{t("detail.notFound.title")}</h1>
				<Link className={styles.back} to="/servicios">
					{t("detail.back")}
				</Link>
			</section>
		);
	}
	return (
		<section className={styles.page}>
			<ItemDetail service={service} />
			<Link className={styles.back} to="/servicios">
				{t("detail.back")}
			</Link>
		</section>
	);
}
