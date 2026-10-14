import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export function Home() {
	const { t } = useTranslation();
	return (
		<>
			<h1>{t("home.title")}</h1>
			<p>{t("home.pitch")}</p>
			<Link to="/servicios">{t("home.cta")}</Link>
		</>
	);
}
