import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { ThemeProvider } from "../../src/theme/ThemeContext";
import { useTheme } from "../../src/theme/useTheme";

function Probe() {
  const { theme, setTheme } = useTheme();
  return (
    <>
      <p>theme: {theme}</p>
      <button type="button" onClick={() => setTheme("frappe")}>
        frappe
      </button>
      <button type="button" onClick={() => setTheme("neon")}>
        neon
      </button>
    </>
  );
}

function renderProbe() {
  return render(
    <ThemeProvider>
      <Probe />
    </ThemeProvider>,
  );
}

function systemPrefers(scheme) {
  window.matchMedia = (query) => ({
    matches: query === `(prefers-color-scheme: ${scheme})`,
  });
}

describe("ThemeProvider", () => {
  afterEach(() => {
    window.matchMedia = undefined;
  });

  it("starts with Latte when the system prefers light", () => {
    systemPrefers("light");
    renderProbe();
    expect(screen.getByText("theme: latte")).toBeInTheDocument();
  });

  it("starts with Mocha when the system prefers dark", () => {
    systemPrefers("dark");
    renderProbe();
    expect(screen.getByText("theme: mocha")).toBeInTheDocument();
  });

  it("starts with Mocha when the browser cannot tell the preference", () => {
    renderProbe();
    expect(screen.getByText("theme: mocha")).toBeInTheDocument();
  });

  it("applies the theme to the root element", () => {
    systemPrefers("light");
    renderProbe();
    expect(document.documentElement).toHaveAttribute("data-theme", "latte");
  });

  it("changes the theme and the root element", async () => {
    const user = userEvent.setup();
    systemPrefers("light");
    renderProbe();
    await user.click(screen.getByRole("button", { name: "frappe" }));
    expect(screen.getByText("theme: frappe")).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute("data-theme", "frappe");
  });
});
