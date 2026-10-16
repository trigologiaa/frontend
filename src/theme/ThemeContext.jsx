import { createContext, useMemo, useState } from "react";
import { resolveInitialTheme } from "./themes";

export const ThemeContext = createContext(null);

function prefersLight() {
	return window.matchMedia?.("(prefers-color-scheme: light)").matches ?? false;
}

export function ThemeProvider({ children }) {
	const [theme] = useState(() =>
		resolveInitialTheme({ stored: null, prefersLight: prefersLight() }),
	);
	const value = useMemo(() => ({ theme }), [theme]);
	return (
		<ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
	);
}
