import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./styles/themes.css";
import "./styles/tokens.css";
import "./styles/global.css";
import { I18nextProvider } from "react-i18next";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./features/auth/context/AuthProvider";
import { CartProvider } from "./features/cart/context/CartContext";
import { i18n } from "./i18n";
import { ThemeProvider } from "./theme/ThemeContext";

createRoot(document.getElementById("root")).render(
	<I18nextProvider i18n={i18n}>
		<StrictMode>
			<ThemeProvider>
				<AuthProvider>
					<CartProvider>
						<BrowserRouter>
							<App />
						</BrowserRouter>
					</CartProvider>
				</AuthProvider>
			</ThemeProvider>
		</StrictMode>
	</I18nextProvider>,
);
