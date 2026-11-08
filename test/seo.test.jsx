import { waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { App } from "../src/App";
import { i18n } from "../src/i18n";
import { seedServices } from "./handlers";
import { renderWithProviders } from "./renderWithProviders";

const admin = { uid: "1", email: "ana@example.com", role: "admin" };

describe("page titles", () => {
  beforeEach(() => {
    seedServices();
  });

  it.each([
    ["/", "Inicio | Trigologiaa Dev", undefined],
    ["/servicios", "Servicios | Trigologiaa Dev", undefined],
    ["/carrito", "Carrito | Trigologiaa Dev", undefined],
    ["/login", "Iniciar sesión | Trigologiaa Dev", undefined],
    ["/registro", "Crear cuenta | Trigologiaa Dev", undefined],
    ["/perfil", "Mi perfil | Trigologiaa Dev", admin],
    ["/admin", "Gestión | Trigologiaa Dev", admin],
    ["/no-existe", "Página no encontrada | Trigologiaa Dev", undefined],
  ])("%s has the title %s", async (route, title, user) => {
    renderWithProviders(<App />, { route, auth: user && { user } });
    await waitFor(() => expect(document.title).toBe(title));
    expect(document.querySelector('meta[name="description"]')).toHaveAttribute(
      "content",
      expect.stringMatching(/\S/),
    );
  });

  it("follows the active language", async () => {
    await i18n.changeLanguage("en");
    renderWithProviders(<App />, { route: "/servicios" });
    await waitFor(() => expect(document.title).toBe("Services | Trigologiaa Dev"));
  });
});
