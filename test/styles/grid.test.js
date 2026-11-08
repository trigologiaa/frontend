import { describe, expect, it } from "vitest";
import app from "../../src/App.jsx?raw";
import main from "../../src/main.jsx?raw";

const sources = { "src/App.jsx": app, "src/main.jsx": main };

describe("bootstrap", () => {
  it("loads the grid stylesheet", () => {
    expect(Object.values(sources).join("\n")).toMatch(
      /import "bootstrap\/dist\/css\/bootstrap-grid\.min\.css"/,
    );
  });

  it("loads no other bootstrap stylesheet", () => {
    const imports = Object.values(sources)
      .join("\n")
      .match(/import "bootstrap[^"]*"/g);
    expect(imports).toEqual(['import "bootstrap/dist/css/bootstrap-grid.min.css"']);
  });
});
