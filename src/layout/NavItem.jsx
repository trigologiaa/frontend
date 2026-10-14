import { Link, matchPath, useLocation } from "react-router-dom";
import styles from "./NavItem.module.css";

export function NavItem({ to, activeFor = [], children }) {
	const { pathname } = useLocation();
	const isActive = [to, ...activeFor].some((path) =>
		matchPath({ path, end: true }, pathname),
	);
	return (
		<Link
			to={to}
			aria-current={isActive ? "page" : undefined}
			className={styles.link}
		>
			{children}
		</Link>
	);
}
