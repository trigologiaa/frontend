import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { App } from "../../../../src/App";
import { RegisterPage } from "../../../../src/features/auth/pages/RegisterPage";
import { renderWithProviders } from "../../../renderWithProviders";

async function fillAndSubmit(user, { password = "secret1", confirm = password } = {}) {
  await user.type(await screen.findByLabelText("Correo electrónico"), "ana@example.com");
  await user.type(screen.getByLabelText("Contraseña"), password);
  await user.type(screen.getByLabelText("Repetir contraseña"), confirm);
  await user.click(screen.getByRole("button", { name: "Registrarme" }));
}

describe("RegisterPage", () => {
  it("has the three fields with the right autocomplete", () => {
    renderWithProviders(<RegisterPage />, { route: "/registro" });
    expect(screen.getByRole("heading", { level: 1, name: "Crear cuenta" })).toBeInTheDocument();
    expect(screen.getByLabelText("Correo electrónico")).toHaveAttribute("autocomplete", "email");
    expect(screen.getByLabelText("Contraseña")).toHaveAttribute("autocomplete", "new-password");
    expect(screen.getByLabelText("Repetir contraseña")).toHaveAttribute(
      "autocomplete",
      "new-password",
    );
  });

  it("sets the document title", async () => {
    renderWithProviders(<RegisterPage />, { route: "/registro" });
    await waitFor(() => expect(document.title).toBe("Crear cuenta | Trigologiaa Dev"));
  });

  it("sends the email and password to signUp and goes home", async () => {
    const user = userEvent.setup();
    const signUp = vi.fn().mockResolvedValue({ uid: "u1", email: "ana@example.com" });
    renderWithProviders(<App />, { route: "/registro", auth: { signUp } });
    await fillAndSubmit(user);
    expect(signUp).toHaveBeenCalledWith("ana@example.com", "secret1");
    expect(
      await screen.findByRole("heading", { level: 1, name: /Software a tu medida/ }),
    ).toBeInTheDocument();
  });

  it("does not call signUp when the passwords differ", async () => {
    const user = userEvent.setup();
    const signUp = vi.fn();
    renderWithProviders(<RegisterPage />, { route: "/registro", auth: { signUp } });
    await fillAndSubmit(user, { password: "secret1", confirm: "secret2" });
    expect(screen.getByRole("alert")).toHaveTextContent("Las contraseñas no coinciden");
    expect(signUp).not.toHaveBeenCalled();
  });

  it("points an email already in use to the sign-in page, without a browser dialog", async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, "confirm");
    const signUp = vi.fn().mockRejectedValue({ code: "auth/email-already-in-use" });
    renderWithProviders(<RegisterPage />, { route: "/registro", auth: { signUp } });
    await fillAndSubmit(user);
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Ese correo ya está registrado");
    expect(alert.querySelector("a")).toHaveAttribute("href", "/login");
    expect(confirmSpy).not.toHaveBeenCalled();
  });

  it("explains a weak password and links the error to the fields", async () => {
    const user = userEvent.setup();
    const signUp = vi.fn().mockRejectedValue({ code: "auth/weak-password" });
    renderWithProviders(<RegisterPage />, { route: "/registro", auth: { signUp } });
    await fillAndSubmit(user, { password: "123" });
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("La contraseña debe tener al menos 6 caracteres");
    expect(alert.querySelector("a")).toBeNull();
    expect(screen.getByLabelText("Correo electrónico")).toHaveAttribute(
      "aria-describedby",
      alert.id,
    );
  });

  it("falls back to a generic message for an error without code", async () => {
    const user = userEvent.setup();
    const signUp = vi.fn().mockRejectedValue(undefined);
    renderWithProviders(<RegisterPage />, { route: "/registro", auth: { signUp } });
    await fillAndSubmit(user);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No pudimos completar el registro",
    );
  });

  it("disables the button until the operation ends", async () => {
    const user = userEvent.setup();
    let finish;
    const signUp = vi.fn(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    renderWithProviders(<RegisterPage />, { route: "/registro", auth: { signUp } });
    await fillAndSubmit(user);
    expect(screen.getByRole("button", { name: "Registrarme" })).toBeDisabled();
    finish();
    expect(await screen.findByRole("button", { name: "Registrarme" })).toBeEnabled();
  });

  it("links to the sign-in page", () => {
    renderWithProviders(<RegisterPage />, { route: "/registro" });
    expect(screen.getByRole("link", { name: "Iniciar sesión" })).toHaveAttribute("href", "/login");
  });

  it("redirects a signed-in user to the home page", () => {
    renderWithProviders(<App />, {
      route: "/registro",
      auth: { user: { uid: "u1", email: "ana@example.com" } },
    });
    expect(screen.queryByLabelText("Repetir contraseña")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cerrar sesión" })).toBeInTheDocument();
  });
});
