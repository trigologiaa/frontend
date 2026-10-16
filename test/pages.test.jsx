import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "../src/App";
import { makeService, servicesHandler } from "./handlers";
import { renderWithProviders } from "./renderWithProviders";
import { server } from "./server";

describe("page structure", () => {
  it.each(["/", "/servicios", "/servicio/service-1", "/carrito", "/no-existe"])(
    "has exactly one main landmark and one level-1 heading at %s",
    async (route) => {
      server.use(servicesHandler([makeService(1)]));
      renderWithProviders(<App />, { route });
      await screen.findByRole("main");
      expect(screen.getAllByRole("main")).toHaveLength(1);
      expect(await screen.findAllByRole("heading", { level: 1 })).toHaveLength(1);
    },
  );
});
