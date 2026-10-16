import { describe, expect, it } from "vitest";

const sources = import.meta.glob("../src/**/*.{js,jsx,ts,tsx,json}", {
  query: "?raw",
  import: "default",
  eager: true,
});

const FORBIDDEN = [
  { pattern: /Persona (Uno|Dos|Tres)/, reason: "placeholder team member" },
  { pattern: /hello@trigologiaa\.dev/, reason: "placeholder contact email" },
  { pattern: /TODO(?!\(#\d+\))/, reason: "TODO without an issue number (use TODO(#12))" },
];

describe("hand-off", () => {
  it.each(FORBIDDEN)("has no $reason left in the source", ({ pattern }) => {
    const offenders = Object.entries(sources)
      .filter(([, content]) => pattern.test(String(content)))
      .map(([file]) => file);
    expect(offenders).toEqual([]);
  });
});
