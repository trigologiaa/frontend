import { render } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "../src/features/auth/context/AuthContext";
import { CartContext, CartProvider } from "../src/features/cart/context/CartContext";
import { i18n } from "../src/i18n";
import { ThemeProvider } from "../src/theme/ThemeContext";

const defaultCart = {
  items: [],
  totalQuantity: 0,
  totalPrice: 0,
  addToCart: () => { },
  removeFromCart: () => { },
  clearCart: () => { },
};

const defaultAuth = {
  user: null,
  loading: false,
  signIn: async () => { },
  signUp: async () => { },
  signOut: async () => { },
};

export function renderWithProviders(ui, { route = "/", cart, initialCart, auth } = {}) {
  const withCart = cart ? (
    <CartContext.Provider value={{ ...defaultCart, ...cart }}>{ui}</CartContext.Provider>
  ) : (
    ui
  );
  return render(
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
        <AuthContext.Provider value={{ ...defaultAuth, ...auth }}>
          <CartProvider initialItems={initialCart}>
            <MemoryRouter initialEntries={[route]}>{withCart}</MemoryRouter>
          </CartProvider>
        </AuthContext.Provider>
      </ThemeProvider>
    </I18nextProvider>,
  );
}

