import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Footer } from "../../src/layout/Footer";
import { renderWithProviders } from "../renderWithProviders";

describe("Footer", () => {
  it("is a content-info landmark with the company name", () => {
    renderWithProviders(<Footer />);
    expect(screen.getByRole("contentinfo")).toHaveTextContent("© Trigologia Dev");
  });
});
