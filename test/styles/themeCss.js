export const FLAVORS = ["latte", "frappe", "macchiato", "mocha"];

export const COLORS = [
  "rosewater",
  "flamingo",
  "pink",
  "mauve",
  "red",
  "maroon",
  "peach",
  "yellow",
  "green",
  "teal",
  "sky",
  "sapphire",
  "blue",
  "lavender",
  "text",
  "subtext1",
  "subtext0",
  "overlay2",
  "overlay1",
  "overlay0",
  "surface2",
  "surface1",
  "surface0",
  "base",
  "mantle",
  "crust",
];

function declarations(body) {
  return Object.fromEntries(
    [...body.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map(([, name, value]) => [
      name,
      value.trim(),
    ]),
  );
}

export function parseFlavors(css) {
  const flavors = {};
  const source = css.replace(/\/\*[\s\S]*?\*\//g, "");
  for (const [, selector, body] of source.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const match = selector.match(/\[data-theme="(\w+)"\]/);
    if (match) {
      flavors[match[1]] = {
        selector: selector.trim(),
        scheme: body.match(/color-scheme:\s*(\w+);/)?.[1],
        colors: Object.fromEntries(
          Object.entries(declarations(body))
            .filter(([name]) => name.startsWith("--ctp-"))
            .map(([name, value]) => [name.replace("--ctp-", ""), value]),
        ),
      };
    }
  }
  return flavors;
}
