import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TeamList } from "../../../../src/features/team/components/TeamList";

const person = (id) => ({ id, name: `Person ${id}`, role: "Role", bio: "Bio" });

describe("TeamList", () => {
  it("renders one card for each person", () => {
    render(<TeamList people={[person(1), person(2), person(3), person(4)]} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(4);
  });

  it("lays the cards out in a responsive grid", () => {
    render(<TeamList people={[person(1), person(2), person(3)]} />);
    expect(screen.getByRole("list")).toHaveClass("row");
    for (const item of screen.getAllByRole("listitem")) {
      expect(item).toHaveClass("col-12", "col-md-4");
    }
  });
});
