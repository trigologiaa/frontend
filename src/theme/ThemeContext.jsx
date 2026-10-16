import { createContext, useEffect, useMemo, useState } from "react";
import { resolveInitialTheme } from "./themes";

export const ThemeContext = createContext(null);

function prefersLight() {
	return window.matchMedia?.("(prefers-color-scheme: light)").matches ?? false;
}

export function ThemeProvider({ children }) {
	const [theme, setTheme] = useState(() =>
		resolveInitialTheme({ stored: null, prefersLight: prefersLight() }),
	);
	useEffect(() => {
		document.documentElement.dataset.theme = theme;
	}, [theme]);
	const value = useMemo(() => ({ theme, setTheme }), [theme]);
	return (
		<ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
	);
}
