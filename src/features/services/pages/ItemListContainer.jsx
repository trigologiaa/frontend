import { useTranslation } from "react-i18next";
import { ItemList } from "../components/ItemList";
import { useServices } from "../hooks/useServices";
import styles from "./ItemListContainer.module.css";

export function ItemListContainer() {
	const { t } = useTranslation();
	const { services, loading, error } = useServices();

	let body;
	if (loading) {
		body = (
			<p className={styles.status} role="status">
				{t("catalog.loading")}
			</p>
		);
	} else if (error) {
		body = (
			<p className={styles.alert} role="alert">
				{t("catalog.error")}
			</p>
		);
	} else if (services.length === 0) {
		body = <p className={styles.empty}>{t("catalog.empty")}</p>;
	} else {
		body = <ItemList services={services} />;
	}

	return (
		<section className={styles.page}>
			<h1 className={styles.title}>{t("nav.services")}</h1>
			{body}
		</section>
	);
}
