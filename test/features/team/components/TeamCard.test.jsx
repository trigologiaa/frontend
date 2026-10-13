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
});
