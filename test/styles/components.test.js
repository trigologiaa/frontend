import { describe, expect, it } from "vitest";

const components = Object.keys(
  import.meta.glob([
    "../../src/layout/*.jsx",
    "../../src/features/*/components/*.jsx",
    "../../src/features/*/pages/*.jsx",
  ]),
).map((path) => path.replace("../../", ""));

const modules = import.meta.glob("../../src/**/*.module.css", {
  query: "?raw",
  import: "default",
  eager: true,
});

const hasStyles = (component) =>
  Boolean(
    modules[`../../${component.replace(/\.jsx$/, ".module.css")}`]?.trim(),
  );

describe("component styles", () => {
  it("gives every component its own CSS module", () => {
    const unstyled = components.filter((component) => !hasStyles(component));
    expect(unstyled).toEqual([]);
  });
});
