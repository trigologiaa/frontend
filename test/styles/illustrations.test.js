import { describe, expect, it } from "vitest";
import services from "../../public/servicios.json";
import themes from "../../src/styles/themes.css?raw";
import { parseFlavors } from "./themeCss";

const svgs = import.meta.glob("../../public/images/*.svg", {
  query: "?raw",
  import: "default",
  eager: true,
});

const palette = new Set(Object.values(parseFlavors(themes).mocha.colors));

describe("service illustrations", () => {
  it.each(services.map((service) => service.image))(
    "uses only Catppuccin colors in %s",
    (image) => {
      const svg = svgs[`../../public${image}`];
      expect(svg, image).toBeDefined();
      const colors = svg.match(/#[0-9a-fA-F]{6}\b/g) ?? [];
      expect(colors.length).toBeGreaterThan(0);
      for (const color of colors) {
        expect(palette.has(color.toLowerCase()), `${image} ${color}`).toBe(true);
      }
    },
  );
});
