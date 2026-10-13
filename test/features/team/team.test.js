import { describe, expect, it } from "vitest";
import { team } from "../../../src/features/team/team";

describe("team data", () => {
  it("had at least three members with unique ids", () => {
    const ids = team.map((person) => person.id);
    expect(team.length).toBeGreaterThanOrEqual(3);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives every member a name, a role key and a bio key", () => {
    for (const person of team) {
      expect(person.name).toBeTruthy();
      expect(person.roleKey).toBeTruthy();
      expect(person.bioKey).toBeTruthy();
    }
  });
});
