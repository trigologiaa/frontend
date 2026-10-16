import { useTranslation } from "react-i18next";
import { THEMES } from "../theme/themes";
import { useTheme } from "../theme/useTheme";
import styles from "./ThemeSwitcher.module.css";

export function ThemeSwitcher() {
	const { t } = useTranslation();
	const { theme } = useTheme();
	return (
		<label className={styles.field}>
			<span className={styles.label}>{t("theme.label")}</span>
			<select className={styles.select} value={theme} onChange={() => {}}>
				{THEMES.map((id) => (
					<option key={id} value={id}>
						{t(`theme.options.${id}`)}
					</option>
				))}
			</select>
		</label>
	);
}
