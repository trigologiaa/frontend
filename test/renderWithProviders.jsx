import { render } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { MemoryRouter } from "react-router-dom";
import { CartContext, CartProvider } from "../src/features/cart/context/CartContext";
import { i18n } from "../src/i18n";

const defaultCart = {
  items: [],
  totalQuantity: 0,
  totalPrice: 0,
  addToCart: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
};

export function renderWithProviders(ui, { route = "/", cart } = {}) {
  const tree = cart ? (
    <CartContext.Provider value={{ ...defaultCart, ...cart }}>{ui}</CartContext.Provider>
  ) : (
    ui
  );
  return render(
    <I18nextProvider i18n={i18n}>
      <CartProvider>
        <MemoryRouter initialEntries={[route]}>{tree}</MemoryRouter>
      </CartProvider>
    </I18nextProvider>
  );
}
