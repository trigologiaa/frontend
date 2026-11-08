import { useTranslation } from "react-i18next";
import {
	FaGear,
	FaRightFromBracket,
	FaRightToBracket,
	FaUser,
	FaUserPlus,
} from "react-icons/fa6";
import { NavItem } from "../../../layout/NavItem";
import { Icon } from "../../../shared/ui/Icon";
import { useAuth } from "../context/useAuth";
import { useSignOut } from "../context/useSignOut";
import styles from "./AuthNav.module.css";

export function AuthNav() {
	const { t } = useTranslation();
	const { user, loading } = useAuth();
	const handleSignOut = useSignOut();
	if (loading) return null;
	if (user) {
		return (
			<>
				<NavItem to="/perfil">
					<Icon icon={FaUser} />
					{t("nav.profile")}
				</NavItem>
				{user.role === "admin" && (
					<NavItem to="/admin">
						<Icon icon={FaGear} />
						{t("nav.admin")}
					</NavItem>
				)}
				<button
					className={styles.signOut}
					type="button"
					onClick={handleSignOut}
				>
					<Icon icon={FaRightFromBracket} />
					{t("nav.logout")}
				</button>
			</>
		);
	}
	return (
		<>
			<NavItem to="/login">
				<Icon icon={FaRightToBracket} />
				{t("nav.login")}
			</NavItem>
			<NavItem to="/registro">
				<Icon icon={FaUserPlus} />
				{t("nav.register")}
			</NavItem>
		</>
	);
}
