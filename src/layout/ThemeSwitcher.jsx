import { useTranslation } from "react-i18next";
import { useTheme } from "../theme/useTheme";
import styles from "./ThemeSwitcher.module.css";

export function ThemeSwitcher() {
	const { t } = useTranslation();
	const { theme } = useTheme();
	return (
		<label className={styles.field}>
			<span className={styles.label}>{t("theme.label")}</span>
			<select className={styles.select} value={theme} onChange={() => {}}>
				<option value="mocha">mocha</option>
			</select>
		</label>
	);
}
