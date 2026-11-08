import { describe, expect, it } from "vitest";
import html from "../index.html?raw";

describe("index.html", () => {
  it("has a title and a description for crawlers that do not run JavaScript", () => {
    expect(html).toMatch(/<title>[^<]*Trigologiaa Dev[^<]*<\/title>/);
    expect(html).toMatch(/<meta\s+name="description"\s+content="[^"]{20,}"/);
  });

  it("does not keep the Vite template title", () => {
    expect(html).not.toMatch(/trigologiaa-dev-javascript/);
  });
});
