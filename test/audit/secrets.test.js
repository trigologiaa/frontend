import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { filesMatching, sources } from "./sources";

const envExample = readFileSync(".env.example", "utf8");

const readVariables = Object.values(sources).flatMap((text) =>
  [...text.matchAll(/import\.meta\.env\.(VITE_\w+)/g)].map((match) => match[1]),
);

const declared = envExample
  .split("\n")
  .map((line) => line.split("=")[0].trim())
  .filter((name) => name.startsWith("VITE_"));

describe("secrets", () => {
  it("has no API key written in the code", () => {
    expect(filesMatching(/AIza[0-9A-Za-z_-]{30,}/), "read keys from import.meta.env").toEqual([]);
    expect(
      filesMatching(/\b(api[_-]?key|secret|token|password)\s*[:=]\s*["'][^"']{8,}["']/i),
    ).toEqual([]);
  });

  it("reads the Firebase configuration only from VITE_ variables", () => {
    expect(readVariables.length).toBeGreaterThan(0);
    expect(filesMatching(/firebaseapp\.com|firebaseio\.com/), "do not hardcode the project").toEqual(
      [],
    );
  });

  it("lists in .env.example every variable that the code reads", () => {
    const missing = [...new Set(readVariables)].filter((name) => !declared.includes(name));
    expect(missing, "add these to .env.example").toEqual([]);
  });
});
