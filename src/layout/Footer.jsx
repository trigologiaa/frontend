import { useTranslation } from "react-i18next";
import { TeamSection } from "../features/team/components/TeamSection";
import styles from "./Footer.module.css";

export function Footer() {
	const { t } = useTranslation();
	return (
		<footer className={styles.footer}>
			<p className={styles.about}>{t("footer.company.about")}</p>
			<a href="mailto:augusto.ribero.15@gmail.com">{t("footer.contact")}</a>
			<TeamSection />
			<p className={styles.rights}>{t("footer.rights")}</p>
		</footer>
	);
}
