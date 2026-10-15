import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { ItemDetailContainer } from "../../../../src/features/services/pages/ItemDetailContainer";
import { servicesHandler } from "../../../handlers";
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
});
