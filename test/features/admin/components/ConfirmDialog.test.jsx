import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ConfirmDialog } from "../../../../src/features/admin/components/ConfirmDialog";

function renderDialog(props) {
  return render(
    <ConfirmDialog
      title="Eliminar servicio"
      message="¿Seguro?"
      confirmLabel="Eliminar"
      cancelLabel="Cancelar"
      onConfirm={() => {}}
      onCancel={() => {}}
      {...props}
    />,
  );
}

describe("ConfirmDialog", () => {
  it("is hidden while it is closed", () => {
    renderDialog({ open: false });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens as a modal dialog with its title", () => {
    renderDialog({ open: true });
    expect(screen.getByRole("dialog", { name: "Eliminar servicio" })).toBeInTheDocument();
  });

  it("closes when the parent closes it", () => {
    const { rerender } = renderDialog({ open: true });
    rerender(
      <ConfirmDialog
        open={false}
        title="T"
        message="M"
        confirmLabel="Sí"
        cancelLabel="No"
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("confirms and cancels with its buttons", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    renderDialog({ open: true, onConfirm, onCancel });
    await user.click(screen.getByRole("button", { name: "Eliminar" }));
    expect(onConfirm).toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(onCancel).toHaveBeenCalled();
  });

  it("cancels when the dialog is closed natively (Escape)", () => {
    const onCancel = vi.fn();
    renderDialog({ open: true, onCancel });
    screen.getByRole("dialog").dispatchEvent(new Event("close"));
    expect(onCancel).toHaveBeenCalled();
  });

  it("disables the confirm button while busy", () => {
    renderDialog({ open: true, busy: true });
    expect(screen.getByRole("button", { name: "Eliminar" })).toBeDisabled();
  });
});
