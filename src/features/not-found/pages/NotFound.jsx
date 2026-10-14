import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import styles from "./NotFound.module.css";

export function NotFound() {
	const { t } = useTranslation();
	return (
		<section className={styles.notFound}>
			<h1 className={styles.title}>{t("notFound.title")}</h1>
			<p className={styles.hint}>{t("notFound.hint")}</p>
			<Link to="/" className={styles.back}>
				{t("notFound.back")}
			</Link>
		</section>
	);
}
