const raw = import.meta.glob("../../src/**/*.{js,jsx}", {
  query: "?raw",
  import: "default",
  eager: true,
});

function stripComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
}

export const sources = Object.fromEntries(
  Object.entries(raw).map(([path, text]) => [path.replace("../../", ""), stripComments(text)]),
);

export function filesMatching(pattern) {
  return Object.entries(sources)
    .filter(([, text]) => pattern.test(text))
    .map(([path]) => path);
}
