import { describe, expect, it } from "vitest";
import { team } from "../../../src/features/team/team";

const images = import.meta.glob("../../../public/images/*.svg");

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

  it("gives every member their own avatar, and the image exists", () => {
    const photos = team.map((person) => person.photo);
    expect(new Set(photos).size).toBe(team.length);
    for (const photo of photos) {
      expect(photo).toMatch(/^\/images\/avatar-\d+\.svg$/);
      expect(Object.keys(images), photo).toContain(`../../../public${photo}`);
    }
  });
});
