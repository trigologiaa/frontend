import {
	createContext,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from "react";
import { isTheme, resolveInitialTheme, THEME_STORAGE_KEY } from "./themes";

export const ThemeContext = createContext(null);

function prefersLight() {
	return window.matchMedia?.("(prefers-color-scheme: light)").matches ?? false;
}

function readStoredTheme() {
	try {
		return localStorage.getItem(THEME_STORAGE_KEY);
	} catch {
		return null;
	}
}

function storeTheme(theme) {
	try {
		localStorage.setItem(THEME_STORAGE_KEY, theme);
	} catch {
		// The theme still applies for this visit when the storage is blocked.
	}
}

export function ThemeProvider({ children }) {
	const [theme, setCurrentTheme] = useState(() =>
		resolveInitialTheme({
			stored: readStoredTheme(),
			prefersLight: prefersLight(),
		}),
	);
	const setTheme = useCallback((next) => {
		if (!isTheme(next)) return;
		setCurrentTheme(next);
		storeTheme(next);
	}, []);

	useEffect(() => {
		document.documentElement.dataset.theme = theme;
	}, [theme]);
	const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);
	return (
		<ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
	);
}
