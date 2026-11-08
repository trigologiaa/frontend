import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { ItemDetailContainer } from "../../../../src/features/services/pages/ItemDetailContainer";
import { i18n } from "../../../../src/i18n";
import {
  failServices,
  makeService,
  seedServices,
} from "../../../handlers";
import { renderWithProviders } from "../../../renderWithProviders";

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
    seedServices();
    renderDetail("service-1");
    expect(screen.getByRole("status")).toHaveTextContent("Cargando...");
  });

  it("shows the service whose id is in the URL", async () => {
    seedServices([makeService(1), makeService(2)]);
    renderDetail("service-2");
    expect(await screen.findByRole("heading", { level: 1, name: "Servicio 2" })).toBeInTheDocument();
    expect(screen.queryByText("Servicio 1")).not.toBeInTheDocument();
  });

  it("shows a not-found message and a link back for an unknown service", async () => {
    seedServices([makeService(1)]);
    renderDetail("does-not-exist");
    expect(await screen.findByRole("heading", { name: "No encontramos ese servicio" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Volver a servicios" })).toHaveAttribute("href", "/servicios");
  });

  it("shows an alert when the service cannot be loaded", async () => {
    failServices();
    renderDetail("service-1");
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No pudimos cargar el servicio. Probá de nuevo más tarde.",
    );
  });

  it("links back to the services from a loaded detail", async () => {
    seedServices([makeService(1)]);
    renderDetail("service-1");
    await screen.findByRole("heading", { level: 1, name: "Servicio 1" });
    expect(screen.getByRole("link", { name: "Volver a servicios" })).toHaveAttribute("href", "/servicios");
  });

  it("does not offer the add button while the service loads", () => {
    seedServices();
    renderDetail("service-1");
    expect(screen.queryByRole("button", { name: "Agregar al carrito" })).not.toBeInTheDocument();
  });

  it("shows the service detail in English", async () => {
    await i18n.changeLanguage("en");
    seedServices([makeService(1)]);
    renderDetail("service-1");
    expect(await screen.findByRole("heading", { level: 1, name: "Service 1" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to services" })).toBeInTheDocument();
  });

  it("shows the spinner while the service loads", () => {
    seedServices();
    const { container } = renderDetail("service-1");
    expect(container.querySelector('[role="status"] [aria-hidden="true"]')).toBeInTheDocument();
  });

  it("retries when the visitor asks for it", async () => {
    const user = userEvent.setup();
    failServices();
    renderDetail("service-1");
    expect(await screen.findByRole("alert")).toBeInTheDocument();

    seedServices([makeService(1)]);
    await user.click(screen.getByRole("button", { name: "Reintentar" }));

    expect(await screen.findByRole("heading", { level: 1, name: "Servicio 1" })).toBeInTheDocument();
  });

  it("titles the page with the service", async () => {
    seedServices([makeService(1)]);
    renderDetail("service-1");
    await waitFor(() => expect(document.title).toBe("Servicio 1 | Trigologiaa Dev"));
    expect(document.querySelector('meta[name="description"]')).toHaveAttribute(
      "content",
      expect.stringMatching(/^Servicio 1 · US\$\s100\. Descripción 1$/),
    );
  });

  it("uses a neutral title while the service loads and a not-found title when missing", async () => {
    seedServices([makeService(1)]);
    renderDetail("nope");
    await waitFor(() => expect(document.title).toBe("Servicio | Trigologiaa Dev"));
    await screen.findByRole("heading", { name: "No encontramos ese servicio" });
    await waitFor(() => expect(document.title).toBe("Servicio no encontrado | Trigologiaa Dev"));
  });

  it("keeps a neutral title when the service cannot be loaded", async () => {
    failServices();
    renderDetail("service-1");
    await screen.findByRole("alert");
    await waitFor(() => expect(document.title).toBe("Servicio | Trigologiaa Dev"));
  });
});
