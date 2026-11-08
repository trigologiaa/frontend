import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ErrorBoundary } from "../../src/shared/ErrorBoundary";
import { renderWithProviders } from "../renderWithProviders";

let shouldFail = true;

function Broken() {
  if (shouldFail) throw new Error("Failed to fetch dynamically imported module");
  return <p>recuperado</p>;
}

afterEach(() => {
  shouldFail = true;
  vi.restoreAllMocks();
});

describe("ErrorBoundary", () => {
  it("shows its children when nothing fails", () => {
    renderWithProviders(
      <ErrorBoundary>
        <p>todo bien</p>
      </ErrorBoundary>,
    );
    expect(screen.getByText("todo bien")).toBeInTheDocument();
  });

  it("shows a message with a way out when a child fails", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    renderWithProviders(
      <ErrorBoundary>
        <Broken />
      </ErrorBoundary>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "No pudimos cargar esta página. Puede que haya una versión nueva del sitio.",
    );
    expect(screen.getByRole("link", { name: "Volver al inicio" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("button", { name: "Recargar" })).toBeInTheDocument();
  });

  it("reloads the page from the reload button", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const reload = vi.fn();
    vi.stubGlobal("location", { ...window.location, reload });
    const user = userEvent.setup();
    renderWithProviders(
      <ErrorBoundary>
        <Broken />
      </ErrorBoundary>,
    );
    await user.click(screen.getByRole("button", { name: "Recargar" }));
    expect(reload).toHaveBeenCalledTimes(1);
    vi.unstubAllGlobals();
  });

  it("draws its children again when the visitor goes back home", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const user = userEvent.setup();
    renderWithProviders(
      <Routes>
        <Route
          path="/"
          element={
            <ErrorBoundary>
              <Broken />
            </ErrorBoundary>
          }
        />
      </Routes>,
    );
    shouldFail = false;
    await user.click(screen.getByRole("link", { name: "Volver al inicio" }));
    expect(screen.getByText("recuperado")).toBeInTheDocument();
  });
});
