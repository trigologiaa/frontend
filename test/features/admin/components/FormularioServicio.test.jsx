import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FormularioServicio } from "../../../../src/features/admin/components/FormularioServicio";
import { i18n } from "../../../../src/i18n";
import { renderWithProviders } from "../../../renderWithProviders";

async function fillValid(user) {
  await user.type(screen.getByLabelText("Título (español)"), "Sitio");
  await user.type(screen.getByLabelText("Título (inglés)"), "Site");
  await user.type(screen.getByLabelText("Descripción (español)"), "Un sitio");
  await user.type(screen.getByLabelText("Descripción (inglés)"), "A site");
  await user.type(screen.getByLabelText("Precio (USD)"), "250");
  await user.type(screen.getByLabelText("URL de la imagen"), "https://example.com/a.png");
}

function renderForm(props) {
  return renderWithProviders(
    <FormularioServicio onSubmit={() => {}} submitLabel="Crear servicio" {...props} />,
  );
}

describe("FormularioServicio", () => {
  it("is a controlled form", async () => {
    const user = userEvent.setup();
    renderForm();
    await user.type(screen.getByLabelText("Título (español)"), "Hola");
    expect(screen.getByLabelText("Título (español)")).toHaveValue("Hola");
  });

  it("emits the values on submit", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderForm({ onSubmit });
    await fillValid(user);
    await user.selectOptions(screen.getByLabelText("Categoría"), "backend");
    await user.click(screen.getByRole("button", { name: "Crear servicio" }));
    expect(onSubmit).toHaveBeenCalledWith({
      titleEs: "Sitio",
      titleEn: "Site",
      descriptionEs: "Un sitio",
      descriptionEn: "A site",
      price: "250",
      category: "backend",
      image: "https://example.com/a.png",
    });
  });

  it("starts from the initial values", () => {
    renderForm({
      initialValues: {
        titleEs: "A",
        titleEn: "B",
        descriptionEs: "C",
        descriptionEn: "D",
        price: "10",
        category: "devops",
        image: "/images/a.svg",
      },
    });
    expect(screen.getByLabelText("Título (español)")).toHaveValue("A");
    expect(screen.getByLabelText("Categoría")).toHaveValue("devops");
  });

  it("disables the submit button while saving", () => {
    renderForm({ saving: true });
    expect(screen.getByRole("button", { name: "Crear servicio" })).toBeDisabled();
  });

  it("shows the save error in an alert", () => {
    renderForm({ errorKey: "admin.errors.save" });
    expect(screen.getByRole("alert")).toHaveTextContent("No pudimos guardar el servicio");
  });

  it("offers a cancel button only when it can cancel", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    const { unmount } = renderForm();
    expect(screen.queryByRole("button", { name: "Cancelar" })).not.toBeInTheDocument();
    unmount();
    renderForm({ onCancel });
    await user.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(onCancel).toHaveBeenCalled();
  });

  it("shows the errors next to the fields and does not submit an invalid form", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderForm({ onSubmit });
    await user.click(screen.getByRole("button", { name: "Crear servicio" }));
    expect(onSubmit).not.toHaveBeenCalled();
    const title = screen.getByLabelText("Título (español)");
    expect(title).toHaveAttribute("aria-invalid", "true");
    expect(title).toHaveAccessibleDescription("Este campo es obligatorio");
    expect(screen.getByLabelText("Precio (USD)")).toHaveAccessibleDescription(
      "Ingresá un precio mayor que 0",
    );
  });

  it("focuses the first invalid field", async () => {
    const user = userEvent.setup();
    renderForm();
    await user.type(screen.getByLabelText("Título (español)"), "Sitio");
    await user.click(screen.getByRole("button", { name: "Crear servicio" }));
    expect(screen.getByLabelText("Título (inglés)")).toHaveFocus();
  });

  it("removes an error as soon as the value is fixed", async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getByRole("button", { name: "Crear servicio" }));
    const title = screen.getByLabelText("Título (español)");
    expect(title).toHaveAttribute("aria-invalid", "true");
    await user.type(title, "Sitio");
    expect(title).not.toHaveAttribute("aria-invalid");
    expect(title).not.toHaveAccessibleDescription();
  });

  it("shows the errors in English", async () => {
    await i18n.changeLanguage("en");
    const user = userEvent.setup();
    renderForm({ submitLabel: "Create service" });
    await user.click(screen.getByRole("button", { name: "Create service" }));
    expect(screen.getByLabelText("Title (Spanish)")).toHaveAccessibleDescription(
      "This field is required",
    );
  });
});
