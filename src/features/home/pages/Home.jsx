import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useDocumentTitle } from "../../../shared/useDocumentTitle";

export function Home() {
	const { t } = useTranslation();
	useDocumentTitle("Trigologiaa Dev");
	return (
		<>
			<h1>{t("home.title")}</h1>
			<p>{t("home.pitch")}</p>
			<Link to="/servicios">{t("home.cta")}</Link>
			<section aria-labelledby="highlights-title">
				<h2 id="highlights-title">{t("home.highlights.title")}</h2>
				<ul>
					<li>{t("home.highlights.web")}</li>
					<li>{t("home.highlights.backend")}</li>
					<li>{t("home.highlights.mentoring")}</li>
				</ul>
			</section>
		</>
	);
}
