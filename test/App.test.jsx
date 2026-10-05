import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "../src/App.jsx";

describe("App", () => {
  it("renders the brand name as the main heading", () => {
    render(<App />);
    expect(screen.getByRole("heading", { level: 1, name: "Trigologiaa Dev" })).toBeInTheDocument();
  });
});
