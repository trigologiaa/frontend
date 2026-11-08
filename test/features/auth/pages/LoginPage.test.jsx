import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { App } from "../../../../src/App";
import { LoginPage } from "../../../../src/features/auth/pages/LoginPage";
import { notify } from "../../../../src/shared/notify";
import { renderWithProviders } from "../../../renderWithProviders";

vi.mock("../../../../src/shared/notify", () => ({
  notify: { success: vi.fn(), error: vi.fn() },
}));

async function fillAndSubmit(user) {
  await user.type(await screen.findByLabelText("Correo electrónico"), "ana@example.com");
  await user.type(screen.getByLabelText("Contraseña"), "secret1");
  await user.click(screen.getByRole("button", { name: "Entrar" }));
}

describe("LoginPage", () => {
  it("has the email and password fields", async () => {
    renderWithProviders(<LoginPage />, { route: "/login" });
    expect(screen.getByRole("heading", { level: 1, name: "Iniciar sesión" })).toBeInTheDocument();
    expect(screen.getByLabelText("Correo electrónico")).toHaveAttribute("autocomplete", "email");
    expect(screen.getByLabelText("Contraseña")).toHaveAttribute(
      "autocomplete",
      "current-password",
    );
    await waitFor(() => expect(document.title).toBe("Iniciar sesión | Trigologiaa Dev"));
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

  it("returns to the page the visitor was going to after signing in", async () => {
    const user = userEvent.setup();
    const signIn = vi.fn().mockResolvedValue({ uid: "u1", email: "ana@example.com" });
    renderWithProviders(
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<p>Panel de prueba</p>} />
      </Routes>,
      { route: { pathname: "/login", state: { returnTo: "/admin" } }, auth: { signIn } },
    );
    await fillAndSubmit(user);
    expect(await screen.findByText("Panel de prueba")).toBeInTheDocument();
  });

  it("sends a visitor who is already signed in to the page they were going to", () => {
    renderWithProviders(
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<p>Panel de prueba</p>} />
      </Routes>,
      {
        route: { pathname: "/login", state: { returnTo: "/admin" } },
        auth: { user: { uid: "u1", email: "ana@example.com" } },
      },
    );
    expect(screen.getByText("Panel de prueba")).toBeInTheDocument();
  });

  it("shows a notice after signing in", async () => {
    const user = userEvent.setup();
    const signIn = vi.fn().mockResolvedValue({ uid: "u1", email: "ana@example.com" });
    renderWithProviders(<LoginPage />, { route: "/login", auth: { signIn } });
    await fillAndSubmit(user);
    expect(notify.success).toHaveBeenCalledWith("toast.signedIn");
  });
});
