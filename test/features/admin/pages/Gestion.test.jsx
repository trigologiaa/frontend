import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Gestion } from "../../../../src/features/admin/pages/Gestion";
import { notify } from "../../../../src/shared/notify";
import {
  failServiceWrites,
  failServices,
  makeService,
  seedServices,
  storedServices,
} from "../../../handlers";
import { renderWithProviders } from "../../../renderWithProviders";

vi.mock("../../../../src/shared/notify", () => ({
  notify: { success: vi.fn(), error: vi.fn() },
}));

async function fillValid(user, title = "Sitio nuevo") {
  await user.type(screen.getByLabelText("Título (español)"), title);
  await user.type(screen.getByLabelText("Título (inglés)"), "New site");
  await user.type(screen.getByLabelText("Descripción (español)"), "Un sitio");
  await user.type(screen.getByLabelText("Descripción (inglés)"), "A site");
  await user.type(screen.getByLabelText("Precio (USD)"), "250");
  await user.type(screen.getByLabelText("URL de la imagen"), "https://example.com/a.png");
}

async function loaded() {
  await screen.findByRole("list");
}

describe("Gestion", () => {
  it("lists the services of the catalog with their price", async () => {
    seedServices([makeService(1), makeService(2)]);
    renderWithProviders(<Gestion />);
    const items = await screen.findAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(within(items[0]).getByText("Servicio 1")).toBeInTheDocument();
    expect(within(items[0]).getByText("US$ 100")).toBeInTheDocument();
  });

  it("shows a loading message and an error when the list cannot be loaded", async () => {
    failServices();
    renderWithProviders(<Gestion />);
    expect(screen.getByRole("status")).toHaveTextContent("Cargando...");
    expect(await screen.findByRole("alert")).toHaveTextContent("No pudimos cargar los servicios");
  });

  describe("create", () => {
    it("creates the service, shows it in the list and resets the form", async () => {
      const user = userEvent.setup();
      seedServices([makeService(1)]);
      renderWithProviders(<Gestion />);
      await loaded();
      await fillValid(user);
      await user.click(screen.getByRole("button", { name: "Crear servicio" }));
      expect(await screen.findByText("Sitio nuevo")).toBeInTheDocument();
      expect(notify.success).toHaveBeenCalledWith("toast.saved");
      expect(screen.getByLabelText("Título (español)")).toHaveValue("");
      expect(storedServices()).toHaveLength(2);
    });

    it("keeps what I typed and shows an alert when the creation fails", async () => {
      const user = userEvent.setup();
      seedServices([makeService(1)]);
      renderWithProviders(<Gestion />);
      await loaded();
      failServiceWrites();
      await fillValid(user);
      await user.click(screen.getByRole("button", { name: "Crear servicio" }));
      expect(await screen.findByRole("alert")).toHaveTextContent("No pudimos guardar el servicio");
      expect(notify.error).toHaveBeenCalledWith("toast.error");
      expect(screen.getByLabelText("Título (español)")).toHaveValue("Sitio nuevo");
      expect(screen.getByRole("button", { name: "Crear servicio" })).toBeEnabled();
    });

    it("does not save while the form is invalid", async () => {
      const user = userEvent.setup();
      seedServices([makeService(1)]);
      renderWithProviders(<Gestion />);
      await loaded();
      await user.click(screen.getByRole("button", { name: "Crear servicio" }));
      expect(storedServices()).toHaveLength(1);
    });
  });

  describe("edit", () => {
    it("loads the service into the form in edit mode", async () => {
      const user = userEvent.setup();
      seedServices([makeService(1), makeService(2)]);
      renderWithProviders(<Gestion />);
      await loaded();
      await user.click(screen.getByRole("button", { name: "Editar Servicio 2" }));
      expect(screen.getByRole("heading", { name: "Editar servicio" })).toBeInTheDocument();
      expect(screen.getByLabelText("Título (español)")).toHaveValue("Servicio 2");
      expect(screen.getByLabelText("Precio (USD)")).toHaveValue(200);
      expect(screen.getByRole("button", { name: "Guardar cambios" })).toBeInTheDocument();
    });

    it("saves the changes without creating a duplicate", async () => {
      const user = userEvent.setup();
      seedServices([makeService(1), makeService(2)]);
      renderWithProviders(<Gestion />);
      await loaded();
      await user.click(screen.getByRole("button", { name: "Editar Servicio 2" }));
      const price = screen.getByLabelText("Precio (USD)");
      await user.clear(price);
      await user.type(price, "999");
      await user.click(screen.getByRole("button", { name: "Guardar cambios" }));
      expect(await screen.findByText("US$ 999")).toBeInTheDocument();
      expect(notify.success).toHaveBeenCalledWith("toast.saved");
      expect(storedServices()).toHaveLength(2);
      expect(screen.getByRole("heading", { name: "Nuevo servicio" })).toBeInTheDocument();
    });

    it("goes back to create mode when I cancel", async () => {
      const user = userEvent.setup();
      seedServices([makeService(1)]);
      renderWithProviders(<Gestion />);
      await loaded();
      await user.click(screen.getByRole("button", { name: "Editar Servicio 1" }));
      await user.click(screen.getByRole("button", { name: "Cancelar" }));
      expect(screen.getByLabelText("Título (español)")).toHaveValue("");
      expect(screen.getByRole("button", { name: "Crear servicio" })).toBeInTheDocument();
    });

    it("keeps my changes and shows an alert when the update fails", async () => {
      const user = userEvent.setup();
      seedServices([makeService(1)]);
      renderWithProviders(<Gestion />);
      await loaded();
      await user.click(screen.getByRole("button", { name: "Editar Servicio 1" }));
      failServiceWrites();
      const price = screen.getByLabelText("Precio (USD)");
      await user.clear(price);
      await user.type(price, "777");
      await user.click(screen.getByRole("button", { name: "Guardar cambios" }));
      expect(await screen.findByRole("alert")).toHaveTextContent("No pudimos guardar el servicio");
      expect(screen.getByLabelText("Precio (USD)")).toHaveValue(777);
    });
  });

  describe("delete", () => {
    it("asks for confirmation and deletes nothing yet", async () => {
      const user = userEvent.setup();
      seedServices([makeService(1), makeService(2)]);
      renderWithProviders(<Gestion />);
      await loaded();
      await user.click(screen.getByRole("button", { name: "Eliminar Servicio 1" }));
      expect(screen.getByRole("dialog", { name: "Eliminar servicio" })).toHaveTextContent(
        "¿Eliminar «Servicio 1»?",
      );
      expect(storedServices()).toHaveLength(2);
    });

    it("keeps the service when I cancel", async () => {
      const user = userEvent.setup();
      seedServices([makeService(1)]);
      renderWithProviders(<Gestion />);
      await loaded();
      await user.click(screen.getByRole("button", { name: "Eliminar Servicio 1" }));
      await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Cancelar" }));
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(screen.getByText("Servicio 1")).toBeInTheDocument();
    });

    it("removes the service when I confirm", async () => {
      const user = userEvent.setup();
      seedServices([makeService(1), makeService(2)]);
      renderWithProviders(<Gestion />);
      await loaded();
      await user.click(screen.getByRole("button", { name: "Eliminar Servicio 1" }));
      await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Eliminar" }));
      await waitFor(() => expect(screen.queryByText("Servicio 1")).not.toBeInTheDocument());
      expect(notify.success).toHaveBeenCalledWith("toast.deleted");
      expect(storedServices().map((service) => service.id)).toEqual(["service-2"]);
    });

    it("keeps the service and shows an alert when the deletion fails", async () => {
      const user = userEvent.setup();
      seedServices([makeService(1)]);
      renderWithProviders(<Gestion />);
      await loaded();
      failServiceWrites();
      await user.click(screen.getByRole("button", { name: "Eliminar Servicio 1" }));
      await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Eliminar" }));
      expect(await screen.findByRole("alert")).toHaveTextContent("No pudimos eliminar el servicio");
      expect(notify.error).toHaveBeenCalledWith("toast.error");
      expect(screen.getByText("Servicio 1")).toBeInTheDocument();
    });

    it("leaves edit mode when the service being edited is deleted", async () => {
      const user = userEvent.setup();
      seedServices([makeService(1)]);
      renderWithProviders(<Gestion />);
      await loaded();
      await user.click(screen.getByRole("button", { name: "Editar Servicio 1" }));
      await user.click(screen.getByRole("button", { name: "Eliminar Servicio 1" }));
      await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Eliminar" }));
      expect(await screen.findByRole("heading", { name: "Nuevo servicio" })).toBeInTheDocument();
    });
  });
});
