import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ItemListContainer } from "../../../../src/features/services/pages/ItemListContainer";
import { makeService, servicesHandler } from "../../../handlers";
import { renderWithProviders } from "../../../renderWithProviders";
import { server } from "../../../server";

describe("ItemListContainer", () => {
  it("shows a loading message while the services load", () => {
    server.use(servicesHandler());
    renderWithProviders(<ItemListContainer />);
    expect(screen.getByRole("status")).toHaveTextContent("Cargando...");
  });

  it("lists the services and hides the loading message once loaded", async () => {
    server.use(
      servicesHandler([makeService(1), makeService(2), makeService(3)]),
    );
    renderWithProviders(<ItemListContainer />);
    expect(await screen.findAllByRole("listitem")).toHaveLength(3);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
