import { render } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { MemoryRouter } from "react-router-dom";
import { CartProvider } from "../src/features/cart/context/CartContext";
import { i18n } from "../src/i18n";

export function renderWithProviders(ui, { route = "/" } = {}) {
  return render(
    <I18nextProvider i18n={i18n}>
      <CartProvider>
        <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
      </CartProvider>
    </I18nextProvider>
  );
}
