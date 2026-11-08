import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { ProtectedRoute } from "../../../src/features/auth/ProtectedRoute";
import { renderWithProviders } from "../../renderWithProviders";

function tree() {
  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<p>Panel de prueba</p>} />
      </Route>
      <Route path="/login" element={<p>Login de prueba</p>} />
    </Routes>
  );
}

function adminTree() {
  return (
    <Routes>
      <Route element={<ProtectedRoute roles={["admin"]} />}>
        <Route path="/admin" element={<p>Panel de prueba</p>} />
      </Route>
      <Route path="/login" element={<p>Login de prueba</p>} />
    </Routes>
  );
}

describe("ProtectedRoute", () => {
  it("sends an anonymous visitor to sign in", () => {
    renderWithProviders(tree(), { route: "/admin" });
    expect(screen.getByText("Login de prueba")).toBeInTheDocument();
    expect(screen.queryByText("Panel de prueba")).not.toBeInTheDocument();
  });

  it("waits while the session is being checked, without redirecting", () => {
    renderWithProviders(tree(), { route: "/admin", auth: { loading: true } });
    expect(screen.getByRole("status")).toHaveTextContent("Cargando...");
    expect(screen.queryByText("Login de prueba")).not.toBeInTheDocument();
    expect(screen.queryByText("Panel de prueba")).not.toBeInTheDocument();
  });

  it("lets a signed-in user in", () => {
    renderWithProviders(tree(), {
      route: "/admin",
      auth: { user: { uid: "1", email: "ana@example.com" } },
    });
    expect(screen.getByText("Panel de prueba")).toBeInTheDocument();
  });

  it("lets an admin in", () => {
    renderWithProviders(adminTree(), {
      route: "/admin",
      auth: { user: { uid: "1", email: "ana@example.com", role: "admin" } },
    });
    expect(screen.getByText("Panel de prueba")).toBeInTheDocument();
  });

  it("tells a regular user they have no permission", () => {
    renderWithProviders(adminTree(), {
      route: "/admin",
      auth: { user: { uid: "2", email: "leo@example.com", role: "user" } },
    });
    expect(
      screen.getByRole("heading", { name: "No tenés permiso para ver esta página" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Panel de prueba")).not.toBeInTheDocument();
  });

  it("waits while the session and role are being read", () => {
    renderWithProviders(adminTree(), { route: "/admin", auth: { loading: true } });
    expect(screen.getByRole("status")).toHaveTextContent("Cargando...");
    expect(screen.queryByText("Login de prueba")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "No tenés permiso para ver esta página" }),
    ).not.toBeInTheDocument();
  });

  it("sends an anonymous visitor to sign in when roles are required", () => {
    renderWithProviders(adminTree(), { route: "/admin" });
    expect(screen.getByText("Login de prueba")).toBeInTheDocument();
  });
});
