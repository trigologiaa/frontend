import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const readme = readFileSync("README.md", "utf8");
const envExample = readFileSync(".env.example", "utf8");
// The stories of the final delivery (US-17 onwards) are linked one by one;
// the pre-delivery ones are linked as a range.
const stories = readdirSync("docs").filter(
  (file) => /^us-\d+.*\.md$/.test(file) && Number(file.match(/^us-(\d+)/)[1]) >= 17,
);

const variables = envExample
  .split("\n")
  .map((line) => line.split("=")[0].trim())
  .filter((name) => name.startsWith("VITE_"));

describe("README", () => {
  it.each([
    "Instalación",
    "Variables de entorno",
    "Configurar Firebase",
    "Ejecutar el proyecto",
    "Pruebas",
    "Compatibilidad de navegadores",
    "Trazabilidad",
    "Limitaciones conocidas",
  ])("has the section %s", (heading) => {
    expect(readme).toMatch(new RegExp(`^##+ .*${heading}`, "mi"));
  });

  it("explains every variable of .env.example", () => {
    const missing = variables.filter((name) => !readme.includes(name));
    expect(missing).toEqual([]);
  });

  it("links every story", () => {
    const missing = stories.filter((file) => !readme.includes(`docs/${file}`));
    expect(missing, "add these to the traceability table").toEqual([]);
  });

  it("has the live URL and the repository URL", () => {
    expect(readme).toMatch(/https:\/\/[\w-]+\.vercel\.app/);
    expect(readme).toMatch(/https:\/\/github\.com\/[\w-]+\/[\w-]+/);
  });

  it("covers the five requirements of the final assignment", () => {
    for (const number of [1, 2, 3, 4, 5]) {
      expect(readme, `requirement ${number}`).toMatch(new RegExp(`\\|\\s*${number}\\s*·`));
    }
  });

  it("has no unfinished marker left", () => {
    expect(readme).not.toMatch(/⟦|TODO|COMPLETAR|lorem/i);
  });
});
