import { useTranslation } from "react-i18next";

export function Home() {
	const { t } = useTranslation();
	return (
		<>
			<h1>{t("home.title")}</h1>
			<p>{t("home.pitch")}</p>
		</>
	);
}
