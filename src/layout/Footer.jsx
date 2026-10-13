import { useTranslation } from "react-i18next";
import { TeamSection } from "../features/team/components/TeamSection";

export function Footer() {
	const { t } = useTranslation();
	return (
		<footer>
			<TeamSection />
			<p>{t("footer.rights")}</p>
		</footer>
	);
}
