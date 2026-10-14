import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TeamCard } from "../../../../src/features/team/components/TeamCard";

describe("TeamCard", () => {
  it("shows the name, the role and the bio of the person", () => {
    render(<TeamCard name="Ada" role="Backend" bio="Builds APIs." />);
    expect(screen.getByRole("heading", { name: "Ada" })).toBeInTheDocument();
    expect(screen.getByText("Backend")).toBeInTheDocument();
    expect(screen.getByText("Builds APIs.")).toBeInTheDocument();
  });

  it("shows the photo with the name as its alternative text", () => {
    render(<TeamCard name="Ada" role="Backend" bio="Builds APIs." photo="/images/ada.jpg" />);
    expect(screen.getByRole("img", { name: "Ada" })).toHaveAttribute("src", "/images/ada.jpg");
  });

  it("falls back to the placeholder avatar when there is no photo", () => {
    render(<TeamCard name="Ada" role="Backend" bio="Builds APIs." />);
    expect(screen.getByRole("img", { name: "Ada" })).toHaveAttribute("src", "/images/avatar-placeholder.svg");
  });
});
