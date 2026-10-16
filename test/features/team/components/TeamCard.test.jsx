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

  it("styles the photo as a fixed-size avatar", () => {
    render(<TeamCard name="Ada" role="Backend" bio="Builds APIs." photo="/images/ada.jpg" />);
    const photo = screen.getByRole("img", { name: "Ada" });
    expect(photo.className).not.toBe("");
    expect(photo).toHaveAttribute("width", "96");
    expect(photo).toHaveAttribute("height", "96");
  });

  it("shows no image when there is no photo", () => {
    render(<TeamCard name="Ada" role="Backend" bio="Builds APIs." />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
