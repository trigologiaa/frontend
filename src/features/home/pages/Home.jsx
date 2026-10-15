import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useDocumentTitle } from "../../../shared/useDocumentTitle";
import styles from "./Home.module.css";

export function Home() {
	const { t } = useTranslation();
	useDocumentTitle("Trigologiaa Dev");
	return (
		<>
			<div className={styles.hero}>
				<h1 className={styles.title}>{t("home.title")}</h1>
				<p className={styles.pitch}>{t("home.pitch")}</p>
				<Link to="/productos" className={styles.cta}>
					{t("home.cta")}
				</Link>
			</div>
			<section
				aria-labelledby="highlights-title"
				className={styles.hightlights}
			>
				<h2 id="highlights-title" className={styles.hightlightsTitle}>
					{t("home.highlights.title")}
				</h2>
				<ul className={styles.hightlightsList}>
					<li className={styles.hightlight}>{t("home.highlights.web")}</li>
					<li className={styles.hightlight}>{t("home.highlights.backend")}</li>
					<li className={styles.hightlight}>
						{t("home.highlights.mentoring")}
					</li>
				</ul>
			</section>
		</>
	);
}
