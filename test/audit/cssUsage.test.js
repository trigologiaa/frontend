import { describe, expect, it } from "vitest";
import { sources } from "./sources";

const modules = import.meta.glob("../../src/**/*.module.css", {
  query: "?raw",
  import: "default",
  eager: true,
});

function definedClasses(css) {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "").replace(/:global\([^)]*\)/g, "");
  const classes = new Set();
  for (const [, selector] of withoutComments.matchAll(/([^{}]+)\{/g)) {
    if (selector.trim().startsWith("@")) continue;
    for (const [, name] of selector.matchAll(/\.([A-Za-z_][\w-]*)/g)) classes.add(name);
  }
  return classes;
}

function usedClasses(source) {
  const classes = new Set();
  for (const [, name] of source.matchAll(/\bstyles\.([A-Za-z_]\w*)/g)) classes.add(name);
  for (const [, name] of source.matchAll(/\bstyles\[\s*["']([^"']+)["']\s*\]/g)) classes.add(name);
  return classes;
}

function componentOf(modulePath) {
  const base = modulePath.replace("../../", "").replace(/\.module\.css$/, "");
  return sources[`${base}.jsx`] ?? sources[`${base}.js`] ?? null;
}

// A module without a component of its own is shared: other modules reuse its classes with `composes`.
function composedClasses() {
  const composed = new Set();
  for (const css of Object.values(modules)) {
    for (const [, names, from] of css.matchAll(/composes:\s*([\w\s-]+?)\s+from\s+["']([^"']+)["']/g)) {
      const file = from.split("/").pop();
      for (const name of names.split(/\s+/)) composed.add(`${file}:${name}`);
    }
  }
  return composed;
}

const composed = composedClasses();

const pairs = Object.entries(modules).map(([path, css]) => ({
  file: path.replace("../../", ""),
  css,
  component: componentOf(path),
}));

describe("CSS Modules", () => {
  it("belong to a component, or are shared through composes", () => {
    const orphans = pairs
      .filter((pair) => pair.component === null)
      .filter((pair) => {
        const name = pair.file.split("/").pop();
        return ![...composed].some((entry) => entry.startsWith(`${name}:`));
      });
    expect(orphans.map((pair) => pair.file)).toEqual([]);
  });

  it("share only classes that another module composes", () => {
    const unused = [];
    for (const { file, css, component } of pairs) {
      if (component !== null) continue;
      const name = file.split("/").pop();
      for (const className of definedClasses(css)) {
        if (!composed.has(`${name}:${className}`)) unused.push(`${file} → .${className}`);
      }
    }
    expect(unused, "delete these classes").toEqual([]);
  });

  it("have no class that its component does not use", () => {
    const unused = [];
    for (const { file, css, component } of pairs) {
      if (component === null) continue;
      const used = usedClasses(component);
      for (const name of definedClasses(css)) {
        if (!used.has(name)) unused.push(`${file} → .${name}`);
      }
    }
    expect(unused, "delete these classes").toEqual([]);
  });

  it("have every class that its component uses", () => {
    const missing = [];
    for (const { file, css, component } of pairs) {
      if (component === null) continue;
      const defined = definedClasses(css);
      for (const name of usedClasses(component)) {
        if (!defined.has(name)) missing.push(`${file} → styles.${name}`);
      }
    }
    expect(missing, "define these classes or fix the typo").toEqual([]);
  });
});
