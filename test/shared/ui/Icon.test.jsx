import { render } from "@testing-library/react";
import { FaTrash } from "react-icons/fa6";
import { describe, expect, it } from "vitest";
import { Icon } from "../../../src/shared/ui/Icon";

describe("Icon", () => {
  it("draws an icon hidden from assistive technology", () => {
    const { container } = render(<Icon icon={FaTrash} />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("focusable", "false");
  });

  it("follows the color of the surrounding text", () => {
    const { container } = render(<Icon icon={FaTrash} />);
    expect(container.querySelector("svg")).toHaveAttribute("fill", "currentColor");
  });
});
