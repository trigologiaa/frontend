import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useLocation } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { ItemListContainer } from "../../../../src/features/services/pages/ItemListContainer";
import { i18n } from "../../../../src/i18n";
import {
  failServices,
  makeService,
  seedServices,
} from "../../../handlers";
import { renderWithProviders } from "../../../renderWithProviders";

const named = (n, es, en, category = "web") => ({
  ...makeService(n),
  title: { es, en },
  category,
});
const catalog = [
  named(1, "Aplicación React", "React app"),
  named(2, "Revisión de código", "Code review", "mentoring"),
  named(3, "Landing page", "Landing page"),
];
const many = Array.from({ length: 14 }, (_, index) => makeService(index + 1));

function LocationProbe() {
  const { search } = useLocation();
  return <p data-testid="location">{search}</p>;
}

describe("ItemListContainer", () => {
  it("shows a loading message while the services load", () => {
    seedServices();
    renderWithProviders(<ItemListContainer />);
    expect(screen.getByRole("status")).toHaveTextContent("Cargando...");
  });

  it("lists the services and hides the loading message once loaded", async () => {
    seedServices([makeService(1), makeService(2), makeService(3)]);
    renderWithProviders(<ItemListContainer />);
    expect(await screen.findAllByRole("listitem")).toHaveLength(3);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("shows an alert and no cards when the services cannot be loaded", async () => {
    failServices();
    renderWithProviders(<ItemListContainer />);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No pudimos cargar los servicios. Probá de nuevo más tarde.",
    );
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });

  it("shows a message when there are no services", async () => {
    seedServices([]);
    renderWithProviders(<ItemListContainer />);
    expect(
      await screen.findByText("Todavía no hay servicios disponibles."),
    ).toBeInTheDocument();
  });

  it("shows the catalog in English", async () => {
    await i18n.changeLanguage("en");
    seedServices([makeService(1)]);
    renderWithProviders(<ItemListContainer />);
    expect(
      await screen.findByRole("heading", { name: "Service 1" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /View details/ })).toBeInTheDocument();
  });

  it("narrows the list while typing", async () => {
    const user = userEvent.setup();
    seedServices(catalog);
    renderWithProviders(<ItemListContainer />);
    expect(await screen.findAllByRole("listitem")).toHaveLength(3);
    await user.type(screen.getByRole("searchbox", { name: "Buscar servicios" }), "react");
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    expect(screen.getByRole("heading", { name: "Aplicación React" })).toBeInTheDocument();
  });

  it("explains when nothing matches and offers to clear the search", async () => {
    const user = userEvent.setup();
    seedServices(catalog);
    renderWithProviders(<ItemListContainer />);
    await screen.findAllByRole("listitem");
    await user.type(screen.getByRole("searchbox"), "zzz");
    expect(screen.getByText("No encontramos servicios para «zzz»")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Limpiar búsqueda" }));
    expect(screen.getByRole("searchbox")).toHaveValue("");
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });

  it("searches the titles of the active language", async () => {
    await i18n.changeLanguage("en");
    const user = userEvent.setup();
    seedServices(catalog);
    renderWithProviders(<ItemListContainer />);
    await screen.findAllByRole("listitem");
    await user.type(screen.getByRole("searchbox", { name: "Search services" }), "code review");
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
  });

  it("starts with the search from the address", async () => {
    seedServices(catalog);
    renderWithProviders(<ItemListContainer />, { route: "/servicios?q=react" });
    expect(screen.getByRole("searchbox")).toHaveValue("react");
    expect(await screen.findAllByRole("listitem")).toHaveLength(1);
  });

  it("writes the search to the address", async () => {
    const user = userEvent.setup();
    seedServices(catalog);
    renderWithProviders(
      <>
        <ItemListContainer />
        <LocationProbe />
      </>,
    );
    await screen.findAllByRole("listitem");
    await user.type(screen.getByRole("searchbox"), "react");
    expect(screen.getByTestId("location")).toHaveTextContent("?q=react");
  });

  it("announces how many services match", async () => {
    const user = userEvent.setup();
    seedServices(catalog);
    renderWithProviders(<ItemListContainer />);
    await screen.findAllByRole("listitem");
    await user.type(screen.getByRole("searchbox"), "react");
    expect(screen.getByRole("status")).toHaveTextContent("1 servicio");
  });

  it("shows six services per page", async () => {
    seedServices(many);
    renderWithProviders(<ItemListContainer />);
    expect(await screen.findAllByRole("heading", { level: 3 })).toHaveLength(6);
    expect(screen.getByRole("navigation", { name: "Paginación" })).toBeInTheDocument();
  });

  it("moves to the next page and writes it to the address", async () => {
    const user = userEvent.setup();
    seedServices(many);
    renderWithProviders(
      <>
        <ItemListContainer />
        <LocationProbe />
      </>,
    );
    await screen.findAllByRole("heading", { level: 3 });
    await user.click(screen.getByRole("button", { name: "Siguiente" }));
    expect(screen.getByTestId("location")).toHaveTextContent("?page=2");
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(6);
  });

  it("keeps the search when it changes page", async () => {
    const user = userEvent.setup();
    seedServices(many);
    renderWithProviders(
      <>
        <ItemListContainer />
        <LocationProbe />
      </>,
      { route: "/servicios?q=servicio" },
    );
    await screen.findAllByRole("heading", { level: 3 });
    await user.click(screen.getByRole("button", { name: "Siguiente" }));
    expect(screen.getByTestId("location")).toHaveTextContent("?q=servicio&page=2");
  });

  it("drops the page from the address when going back to the first page", async () => {
    const user = userEvent.setup();
    seedServices(many);
    renderWithProviders(
      <>
        <ItemListContainer />
        <LocationProbe />
      </>,
      { route: "/servicios?page=2" },
    );
    await screen.findAllByRole("heading", { level: 3 });
    await user.click(screen.getByRole("button", { name: "Anterior" }));
    expect(screen.getByTestId("location")).toBeEmptyDOMElement();
  });

  it("shows the rest on the last page", async () => {
    seedServices(many);
    renderWithProviders(<ItemListContainer />, { route: "/servicios?page=3" });
    expect(await screen.findAllByRole("heading", { level: 3 })).toHaveLength(2);
  });

  it("falls back to the nearest page when the address asks for one that does not exist", async () => {
    seedServices(many);
    renderWithProviders(<ItemListContainer />, { route: "/servicios?page=99" });
    expect(await screen.findAllByRole("heading", { level: 3 })).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Página 3" })).toHaveAttribute("aria-current", "page");
  });

  it("goes back to the first page when the search changes", async () => {
    const user = userEvent.setup();
    seedServices(many);
    renderWithProviders(
      <>
        <ItemListContainer />
        <LocationProbe />
      </>,
      { route: "/servicios?page=2" },
    );
    await screen.findAllByRole("heading", { level: 3 });
    await user.type(screen.getByRole("searchbox"), "Servicio 1");
    expect(screen.getByTestId("location").textContent).not.toContain("page");
  });

  it("moves the focus to the title when the page changes", async () => {
    const user = userEvent.setup();
    seedServices(many);
    renderWithProviders(<ItemListContainer />);
    await screen.findAllByRole("heading", { level: 3 });
    await user.click(screen.getByRole("button", { name: "Siguiente" }));
    expect(screen.getByRole("heading", { level: 1 })).toHaveFocus();
  });

  it("shows the spinner and no cards while loading", () => {
    seedServices();
    const { container } = renderWithProviders(<ItemListContainer />);
    expect(container.querySelector('[role="status"] [aria-hidden="true"]')).toBeInTheDocument();
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });

  it("retries when the visitor asks for it", async () => {
    const user = userEvent.setup();
    failServices();
    renderWithProviders(<ItemListContainer />);
    expect(await screen.findByRole("alert")).toBeInTheDocument();

    seedServices([makeService(1), makeService(2)]);
    await user.click(screen.getByRole("button", { name: "Reintentar" }));

    expect(await screen.findAllByRole("listitem")).toHaveLength(2);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
