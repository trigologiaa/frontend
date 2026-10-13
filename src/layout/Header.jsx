import { Link } from "react-router-dom";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Header() {
	return (
		<header>
			<Link to="/">Trigologiaa Dev</Link>
			<LanguageSwitcher />
		</header>
	);
}
