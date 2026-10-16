import { describe, expect, it } from "vitest";
import services from "../../../../public/servicios.json";

const images = Object.keys(import.meta.glob("../../../../public/images/*.svg"));

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

  it("gives every service its own illustration, and the file exists", () => {
    const pictures = services.map((service) => service.image);
    expect(new Set(pictures).size).toBe(services.length);
    for (const picture of pictures) {
      expect(picture).toMatch(/^\/images\/servicio-[\w-]+\.svg$/);
      expect(images, picture).toContain(`../../../../public${picture}`);
    }
  });

  it("does not leave unused service illustrations behind", () => {
    const used = new Set(services.map((service) => `../../../../public${service.image}`));
    const unused = images.filter((image) => /servicio-/.test(image) && !used.has(image));
    expect(unused).toEqual([]);
  });
});
