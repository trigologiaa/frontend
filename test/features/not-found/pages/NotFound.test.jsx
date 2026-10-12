import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "../../../renderWithProviders.jsx";
import userEvent from "@testing-library/user-event";
import { App } from "../../../../src/App.jsx";

describe("NotFound", () => {
  it("leads back home from the not-found page", async () => {
    const user = userEvent.setup();
    renderWithProviders(<App />, { route: "/esto-no-existe" });
    await user.click(screen.getByRole("link", { name: "Volver al inicio" }));
    expect(screen.getByRole("heading", { level: 1, name: "Inicio" })).toBeInTheDocument();
  });
});
