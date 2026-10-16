import {
	createContext,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from "react";
import { isTheme, resolveInitialTheme } from "./themes";

export const ThemeContext = createContext(null);

function prefersLight() {
	return window.matchMedia?.("(prefers-color-scheme: light)").matches ?? false;
}

export function ThemeProvider({ children }) {
	const [theme, setCurrentTheme] = useState(() =>
		resolveInitialTheme({ stored: null, prefersLight: prefersLight() }),
	);
	const setTheme = useCallback((next) => {
		if (isTheme(next)) setCurrentTheme(next);
	}, []);

	useEffect(() => {
		document.documentElement.dataset.theme = theme;
	}, [theme]);
	const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);
	return (
		<ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
	);
}
