const channels = (hex) => [1, 3, 5].map((i) => Number.parseInt(hex.slice(i, i + 2), 16));

const toHex = (rgb) =>
  `#${rgb.map((c) => Math.round(c).toString(16).padStart(2, "0")).join("")}`;

function luminance(hex) {
  const [r, g, b] = channels(hex).map((c) => {
    const value = c / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(foreground, background) {
  const [lighter, darker] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

// Resolves "var(--ctp-x)", "#rrggbb" and "color-mix(in srgb, A p%, B)" against one flavor.
export function resolve(value, colors) {
  const text = value.trim();
  const variable = text.match(/^var\(--ctp-([\w]+)\)$/);
  if (variable) return colors[variable[1]];
  if (/^#[0-9a-f]{6}$/i.test(text)) return text.toLowerCase();
  const mix = text.match(/^color-mix\(in srgb,\s*(.+?)\s+(\d+)%,\s*(.+)\)$/);
  if (mix) {
    const [first, second] = [resolve(mix[1], colors), resolve(mix[3], colors)];
    const weight = Number(mix[2]) / 100;
    return toHex(channels(first).map((c, i) => c * weight + channels(second)[i] * (1 - weight)));
  }
  throw new Error(`Cannot resolve "${value}"`);
}
