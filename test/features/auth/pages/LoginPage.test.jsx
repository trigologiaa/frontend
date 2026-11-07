import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { App } from "../../../../src/App";
import { LoginPage } from "../../../../src/features/auth/pages/LoginPage";
import { renderWithProviders } from "../../../renderWithProviders";

async function fillAndSubmit(user) {
  await user.type(screen.getByLabelText("Correo electrónico"), "ana@example.com");
  await user.type(screen.getByLabelText("Contraseña"), "secret1");
  await user.click(screen.getByRole("button", { name: "Entrar" }));
}

describe("LoginPage", () => {
  it("has the email and password fields", () => {
    renderWithProviders(<LoginPage />, { route: "/login" });
    expect(screen.getByRole("heading", { level: 1, name: "Iniciar sesión" })).toBeInTheDocument();
    expect(screen.getByLabelText("Correo electrónico")).toHaveAttribute("autocomplete", "email");
    expect(screen.getByLabelText("Contraseña")).toHaveAttribute(
      "autocomplete",
      "current-password",
    );
    expect(document.title).toBe("Iniciar sesión");
  });

  it("signs in and goes home", async () => {
    const user = userEvent.setup();
    const signIn = vi.fn().mockResolvedValue({ uid: "u1", email: "ana@example.com" });
    renderWithProviders(<App />, { route: "/login", auth: { signIn } });
    await fillAndSubmit(user);
    expect(signIn).toHaveBeenCalledWith("ana@example.com", "secret1");
    expect(
      await screen.findByRole("heading", { level: 1, name: /Software a tu medida/ }),
    ).toBeInTheDocument();
  });

  it("shows a message for wrong credentials and re-enables the button", async () => {
    const user = userEvent.setup();
    const signIn = vi.fn().mockRejectedValue({ code: "auth/invalid-credential" });
    renderWithProviders(<LoginPage />, { route: "/login", auth: { signIn } });
    await fillAndSubmit(user);
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Correo o contraseña incorrectos");
    expect(screen.getByLabelText("Contraseña")).toHaveAttribute("aria-describedby", alert.id);
    expect(screen.getByRole("button", { name: "Entrar" })).toBeEnabled();
  });

  it("falls back to a generic message for an error without code", async () => {
    const user = userEvent.setup();
    const signIn = vi.fn().mockRejectedValue(undefined);
    renderWithProviders(<LoginPage />, { route: "/login", auth: { signIn } });
    await fillAndSubmit(user);
    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });

  it("links to the registration page", () => {
    renderWithProviders(<LoginPage />, { route: "/login" });
    expect(screen.getByRole("link", { name: "Crear cuenta" })).toHaveAttribute("href", "/registro");
  });

  it("redirects a signed-in user to the home page", () => {
    renderWithProviders(<App />, {
      route: "/login",
      auth: { user: { uid: "u1", email: "ana@example.com" } },
    });
    expect(screen.queryByLabelText("Contraseña")).not.toBeInTheDocument();
  });
});
