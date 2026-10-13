import { useTranslation } from "react-i18next";

export function LanguageSwitcher() {
	const { i18n } = useTranslation();
	return (
		<div>
			{["es", "en"].map((language) => (
				<button
					key={language}
					type="button"
					aria-pressed={i18n.resolvedLanguage === language}
					onClick={() => i18n.changeLanguage(language)}
				>
					{language.toUpperCase()}
				</button>
			))}
		</div>
	);
}
