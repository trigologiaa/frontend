// Declarations (as text) of the rules whose selector is exactly one of the element's classes.
export function declarationsFor(element) {
  const css = [...document.querySelectorAll("style")]
    .map((style) => style.textContent)
    .join("");
  const classes = element.className.split(/\s+/).filter(Boolean);
  const declarations = [];
  for (const [, selector, body] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (classes.includes(selector.trim().replace(/^\./, ""))) declarations.push(body);
  }
  return declarations.join(";");
}
