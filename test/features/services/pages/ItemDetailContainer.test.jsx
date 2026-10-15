import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { ItemDetailContainer } from "../../../../src/features/services/pages/ItemDetailContainer";
import { i18n } from "../../../../src/i18n";
import {
  failingServicesHandler,
  makeService,
  servicesHandler,
} from "../../../handlers";
import { renderWithProviders } from "../../../renderWithProviders";
import { server } from "../../../server";

function renderDetail(id) {
  return renderWithProviders(
    <Routes>
      <Route path="/servicio/:id" element={<ItemDetailContainer />} />
    </Routes>,
    { route: `/servicio/${id}` },
  );
}

describe("ItemDetailContainer", () => {
  it("shows a loading message while the service loads", () => {
    server.use(servicesHandler());
    renderDetail("service-1");
    expect(screen.getByRole("status")).toHaveTextContent("Cargando...");
  });

  it("shows the service whose id is in the URL", async () => {
    server.use(servicesHandler([makeService(1), makeService(2)]));
    renderDetail("service-2");
    expect(await screen.findByRole("heading", { level: 1, name: "Servicio 2" })).toBeInTheDocument();
    expect(screen.queryByText("Servicio 1")).not.toBeInTheDocument();
  });

  it("shows a not-found message and a link back for an unknown service", async () => {
    server.use(servicesHandler([makeService(1)]));
    renderDetail("does-not-exist");
    expect(await screen.findByRole("heading", { name: "No encontramos ese servicio" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Volver a servicios" })).toHaveAttribute("href", "/servicios");
  });

  it("shows an alert when the service cannot be loaded", async () => {
    server.use(failingServicesHandler());
    renderDetail("service-1");
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No pudimos cargar el servicio. Probá de nuevo más tarde.",
    );
  });

  it("links back to the services from a loaded detail", async () => {
    server.use(servicesHandler([makeService(1)]));
    renderDetail("service-1");
    await screen.findByRole("heading", { level: 1, name: "Servicio 1" });
    expect(screen.getByRole("link", { name: "Volver a servicios" })).toHaveAttribute("href", "/servicios");
  });

  it("does not offer the add button while the service loads", () => {
    server.use(servicesHandler());
    renderDetail("service-1");
    expect(screen.queryByRole("button", { name: "Agregar al carrito" })).not.toBeInTheDocument();
  });

  it("shows the service detail in English", async () => {
    await i18n.changeLanguage("en");
    server.use(servicesHandler([makeService(1)]));
    renderDetail("service-1");
    expect(await screen.findByRole("heading", { level: 1, name: "Service 1" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to services" })).toBeInTheDocument();
  });
});
