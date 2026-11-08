import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Seo } from "../../../shared/Seo";
import { Button } from "../../../shared/ui/Button";
import styles from "./Home.module.css";

export function Home() {
	const { t } = useTranslation();
	return (
		<>
			<Seo
				title={t("seo.home.title")}
				description={t("seo.home.description")}
			/>
			<div className={styles.hero}>
				<h1 className={styles.title}>{t("home.title")}</h1>
				<p className={styles.pitch}>{t("home.pitch")}</p>
				<Button as={Link} to="/servicios" size="lg">
					{t("home.cta")}
				</Button>
			</div>
			<section aria-labelledby="highlights-title" className={styles.highlights}>
				<h2 id="highlights-title" className={styles.highlightsTitle}>
					{t("home.highlights.title")}
				</h2>
				<ul className={styles.highlightsList}>
					<li className={styles.highlight}>{t("home.highlights.web")}</li>
					<li className={styles.highlight}>{t("home.highlights.backend")}</li>
					<li className={styles.highlight}>{t("home.highlights.mentoring")}</li>
				</ul>
			</section>
		</>
	);
}
