import { useTranslation } from "react-i18next";
import { NavItem } from "../../../layout/NavItem";
import { useAuth } from "../context/useAuth";
import styles from "./AuthNav.module.css";

export function AuthNav() {
	const { t } = useTranslation();
	const { user, loading, signOut } = useAuth();
	if (loading) return null;
	if (user) {
		return (
			<button className={styles.signOut} type="button" onClick={signOut}>
				{t("nav.logout")}
			</button>
		);
	}
	return (
		<>
			<NavItem to="/login">{t("nav.login")}</NavItem>
			<NavItem to="/registro">{t("nav.register")}</NavItem>
		</>
	);
}
