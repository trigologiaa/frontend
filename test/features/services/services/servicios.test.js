import { describe, expect, it } from "vitest";
import services from "../../../../public/servicios.json";

describe("public/servicios.json", () => {
  it("has at least six services with unique ids and both languages", () => {
    const ids = services.map((service) => service.id);
    expect(services.length).toBeGreaterThanOrEqual(6);
    expect(new Set(ids).size).toBe(ids.length);
    for (const service of services) {
      expect(service.title.es && service.title.en).toBeTruthy();
      expect(service.description.es && service.description.en).toBeTruthy();
      expect(service.price).toBeGreaterThan(0);
    }
  });
});
