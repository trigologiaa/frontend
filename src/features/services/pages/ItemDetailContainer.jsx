import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { localized } from "../../../shared/localized";
import { Seo } from "../../../shared/Seo";
import { Spinner } from "../../../shared/Spinner";
import { Button } from "../../../shared/ui/Button";
import { useLanguage } from "../../../shared/useLanguage";
import { ItemDetail } from "../../services/components/ItemDetail";
import { useService } from "../../services/hooks/useService";
import { serviceDescription } from "../seo";
import styles from "./ItemDetailContainer.module.css";

export function ItemDetailContainer() {
	const { id } = useParams();
	const { t } = useTranslation();
	const language = useLanguage();
	const { service, loading, error, reload } = useService(id);

	if (loading) {
		return (
			<>
				<Seo title={t("seo.service.title")} />
				<div className={styles.status}>
					<Spinner />
				</div>
			</>
		);
	}
	if (error) {
		return (
			<>
				<Seo title={t("seo.service.title")} />
				<div className={styles.alert} role="alert">
					<p>{t("detail.error")}</p>
					<Button variant="secondary" onClick={reload}>
						{t("common.retry")}
					</Button>
				</div>
			</>
		);
	}
	if (!service) {
		return (
			<section className={styles.notFound}>
				<Seo title={t("seo.serviceNotFound.title")} />
				<h1 className={styles.notFoundTitle}>{t("detail.notFound.title")}</h1>
				<Link className={styles.back} to="/servicios">
					{t("detail.back")}
				</Link>
			</section>
		);
	}
	return (
		<section className={styles.page}>
			<Seo
				title={localized(service.title, language)}
				description={serviceDescription(service, language)}
			/>
			<ItemDetail service={service} />
			<Link className={styles.back} to="/servicios">
				{t("detail.back")}
			</Link>
		</section>
	);
}
