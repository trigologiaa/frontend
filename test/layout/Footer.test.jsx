import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Footer } from "../../src/layout/Footer";

describe("Footer", () => {
  it("is a content-info landmark with the company name", () => {
    render(<Footer />);
    expect(screen.getByRole("contentinfo")).toHaveTextContent("© Trigologia Dev");
  });
});
