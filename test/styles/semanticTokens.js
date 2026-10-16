export function parseSemanticTokens(css) {
  const source = css.replace(/\/\*[\s\S]*?\*\//g, "");
  return Object.fromEntries(
    [...source.matchAll(/(--color-[\w-]+):\s*([^;]+);/g)].map(([, name, value]) => [
      name,
      value.replace(/\s+/g, " ").replace(/\(\s+/g, "(").replace(/,?\s+\)/g, ")").trim(),
    ]),
  );
}
