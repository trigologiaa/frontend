import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FaTrash } from "react-icons/fa6";
import { Link, MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { Button } from "../../../src/shared/ui/Button";
import styles from "../../../src/shared/ui/Button.styles?raw";
import { declarationsFor } from "../../styles/styledRules";

describe("Button", () => {
  it("renders a real button that does not submit forms by accident", () => {
    render(<Button>Guardar</Button>);
    const button = screen.getByRole("button", { name: "Guardar" });
    expect(button).toHaveAttribute("type", "button");
  });

  it("lets the caller make it a submit button", () => {
    render(<Button type="submit">Enviar</Button>);
    expect(screen.getByRole("button", { name: "Enviar" })).toHaveAttribute("type", "submit");
  });

  it("is primary by default", () => {
    render(<Button>Guardar</Button>);
    const rules = declarationsFor(screen.getByRole("button"));
    expect(rules).toContain("background:var(--color-primary)");
    expect(rules).toContain("color:var(--color-primary-contrast)");
  });

  it.each([
    ["primary", "background:var(--color-primary)"],
    ["secondary", "background:var(--color-surface)"],
    ["danger", "background:var(--color-danger-surface)"],
  ])("paints the %s variant with its token", (variant, declaration) => {
    render(<Button variant={variant}>Acción</Button>);
    expect(declarationsFor(screen.getByRole("button"))).toContain(declaration);
  });

  it("can be rendered as a router link with the same look", () => {
    render(
      <MemoryRouter>
        <Button as={Link} to="/servicios">
          Ver servicios
        </Button>
      </MemoryRouter>,
    );
    const link = screen.getByRole("link", { name: "Ver servicios" });
    expect(link).toHaveAttribute("href", "/servicios");
    expect(link).not.toHaveAttribute("type");
    expect(declarationsFor(link)).toContain("background:var(--color-primary)");
  });

  it("ignores clicks when it is disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Guardar
      </Button>,
    );
    await user.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("does not leak its style props into the HTML", () => {
    render(<Button variant="danger">Eliminar</Button>);
    const names = screen.getByRole("button").getAttributeNames();
    expect(names).not.toContain("variant");
    expect(names).not.toContain("$variant");
  });

  it("never turns the keyboard focus ring off", () => {
    expect(styles).not.toMatch(/outline:\s*(none|0)/);
  });

  it.each([
    ["md", "padding:0 var(--space-4)"],
    ["lg", "padding:0 var(--space-6)"],
  ])("has the %s size", (size, declaration) => {
    render(<Button size={size}>Acción</Button>);
    expect(declarationsFor(screen.getByRole("button"))).toContain(declaration);
  });

  it("shows an icon before the label without changing its name", () => {
    render(
      <Button icon={FaTrash} variant="danger">
        Eliminar
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Eliminar" });
    const svg = button.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(button.firstElementChild).toBe(svg);
  });
});
