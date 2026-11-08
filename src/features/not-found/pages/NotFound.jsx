import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Seo } from "../../../shared/Seo";
import { Button } from "../../../shared/ui/Button";
import styles from "./NotFound.module.css";

export function NotFound() {
	const { t } = useTranslation();
	return (
		<section className={styles.notFound}>
			<Seo
				title={t("seo.notFound.title")}
				description={t("seo.notFound.description")}
			/>
			<h1 className={styles.title}>{t("notFound.title")}</h1>
			<p className={styles.hint}>{t("notFound.hint")}</p>
			<Button as={Link} to="/">
				{t("notFound.back")}
			</Button>
		</section>
	);
}
