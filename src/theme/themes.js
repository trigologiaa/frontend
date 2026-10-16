export const THEMES = ["latte", "frappe", "macchiato", "mocha"];

export const THEME_STORAGE_KEY = "theme";

export function isTheme(value) {
	return THEMES.includes(value);
}

export function systemTheme(prefersLight) {
	return prefersLight ? "latte" : "mocha";
}

export function resolveInitialTheme({ stored, prefersLight }) {
	return isTheme(stored) ? stored : systemTheme(prefersLight);
}
