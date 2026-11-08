import { useTranslation } from "react-i18next";
import { Seo } from "../../../shared/Seo";
import { Button } from "../../../shared/ui/Button";
import { useAuth } from "../context/useAuth";
import { useSignOut } from "../context/useSignOut";
import styles from "./ProfilePage.module.css";

export function ProfilePage() {
	const { t } = useTranslation();
	const { user } = useAuth();
	const handleSignOut = useSignOut();

	return (
		<section className={styles.page}>
			<Seo
				title={t("seo.profile.title")}
				description={t("seo.profile.description")}
			/>
			<h1 className={styles.title}>{t("profile.title")}</h1>
			<p className={styles.greeting}>
				{t("profile.greeting", { email: user.email })}
			</p>
			<p className={styles.role}>{t(`profile.role.${user.role}`)}</p>
			<Button variant="secondary" onClick={handleSignOut}>
				{t("nav.logout")}
			</Button>
		</section>
	);
}
