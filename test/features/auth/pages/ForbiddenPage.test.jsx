import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ForbiddenPage } from "../../../../src/features/auth/pages/ForbiddenPage";
import { renderWithProviders } from "../../../renderWithProviders";

describe("ForbiddenPage", () => {
  it("tells the user they have no permission and links home", () => {
    renderWithProviders(<ForbiddenPage />);
    expect(
      screen.getByRole("heading", { name: "No tenés permiso para ver esta página" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Volver al inicio" })).toHaveAttribute("href", "/");
  });
});
