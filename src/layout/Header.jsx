import { Link } from "react-router-dom";
import styles from "./Header.module.css";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Header() {
	return (
		<header className={styles.header}>
			<Link to="/" className={styles.brand}>
				Trigologiaa Dev
			</Link>
			<LanguageSwitcher />
		</header>
	);
}
