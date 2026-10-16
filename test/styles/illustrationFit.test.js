import { describe, expect, it } from "vitest";
import cartItem from "../../src/features/cart/components/CartItem.module.css?raw";
import item from "../../src/features/services/components/Item.module.css?raw";
import itemDetail from "../../src/features/services/components/ItemDetail.module.css?raw";

// The service illustrations are square badges with transparent corners: cropping them to a
// wide frame (object-fit: cover) would cut the circle, so they must be shown whole.
const rule = (css) => css.match(/^\.image\s*\{([^}]*)\}/m)?.[1] ?? "";

describe.each([
  ["Item", item],
  ["ItemDetail", itemDetail],
  ["CartItem", cartItem],
])("%s illustration", (_name, css) => {
  it("shows the whole illustration instead of cropping it", () => {
    expect(rule(css)).toMatch(/object-fit:\s*contain/);
    expect(rule(css)).not.toMatch(/object-fit:\s*cover/);
  });
});

describe.each([
  ["Item", item],
  ["ItemDetail", itemDetail],
])("%s illustration frame", (_name, css) => {
  it("sits on the surface color with room around the circle", () => {
    expect(rule(css)).toMatch(/background:\s*var\(--color-surface\)/);
    expect(rule(css)).toMatch(/padding:\s*var\(--space-\d\)/);
  });
});

describe("CartItem illustration", () => {
  it("is a square, like the badge", () => {
    expect(rule(cartItem)).toMatch(/aspect-ratio:\s*1(\s*\/\s*1)?\s*;/);
  });
});
