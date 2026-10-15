import { describe, expect, it } from "vitest";

const pending = [
  "src/features/services/pages/ItemDetailContainer.jsx",
  "src/features/cart/pages/CartPage.jsx",

];

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
  it("gives every component outside the pending list its own CSS module", () => {
    const unstyled = components.filter(
      (component) => !pending.includes(component) && !hasStyles(component),
    );
    expect(unstyled).toEqual([]);
  });

  it("removes a component from the pending list once it is styled", () => {
    const stale = pending.filter((component) => hasStyles(component));
    expect(stale).toEqual([]);
  });
});
