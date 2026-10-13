import { useTranslation } from "react-i18next";
import { TeamSection } from "../features/team/components/TeamSection";

export function Footer() {
	const { t } = useTranslation();
	return (
		<footer>
			<p>{t("footer.company.about")}</p>
			<a href="mailto:hello@trigologiaa.dev">{t("footer.contact")}</a>
			<TeamSection />
			<p>{t("footer.rights")}</p>
		</footer>
	);
}
