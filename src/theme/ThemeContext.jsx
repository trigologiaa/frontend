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

export function ThemeProvider({ children }) {
	const [theme, setCurrentTheme] = useState(() =>
		resolveInitialTheme({
			stored: localStorage.getItem(THEME_STORAGE_KEY),
			prefersLight: prefersLight(),
		}),
	);
	const setTheme = useCallback((next) => {
		if (!isTheme(next)) return;
		setCurrentTheme(next);
		localStorage.setItem(THEME_STORAGE_KEY, next);
	}, []);

	useEffect(() => {
		document.documentElement.dataset.theme = theme;
	}, [theme]);
	const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);
	return (
		<ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
	);
}
