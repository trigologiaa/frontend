import { useTranslation } from "react-i18next";
import styles from "./LanguageSwitcher.module.css";

export function LanguageSwitcher() {
	const { t, i18n } = useTranslation();
	return (
		<fieldset className={styles.group}>
			<legend className={styles.legend}>{t("language.label")}</legend>
			{["es", "en"].map((language) => (
				<button
					key={language}
					className={styles.button}
					type="button"
					aria-pressed={i18n.resolvedLanguage === language}
					onClick={() => i18n.changeLanguage(language)}
				>
					{language.toUpperCase()}
				</button>
			))}
		</fieldset>
	);
}
