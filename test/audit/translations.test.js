import { describe, expect, it } from "vitest";
import es from "../../src/i18n/locales/es.json";
import { sources } from "./sources";

// Keys built at runtime (t(`prefix.${value}`)) cannot be seen as text.
// Every prefix carries its reason; do not add one without writing it.
const DYNAMIC_PREFIXES = [
  "categories.", // t(`categories.${service.category}`)
  "theme.", // theme names and options are looked up from the theme list
  "profile.role.", // t(`profile.role.${user.role}`)
  "team.", // the team data brings its own keys
  "admin.form.", // t(`admin.form.${field.name}`)
  "checkout.name", // t(`checkout.${field.name}`)
  "checkout.email", // t(`checkout.${field.name}`)
  "checkout.phone", // t(`checkout.${field.name}`)
];

function flatten(object, prefix = "") {
  return Object.entries(object).flatMap(([key, value]) =>
    typeof value === "object" ? flatten(value, `${prefix}${key}.`) : [`${prefix}${key}`],
  );
}

const used = new Set(
  Object.values(sources).flatMap((text) =>
    [...text.matchAll(/["'`]([a-z][\w]*(?:\.[\w]+)+)["'`]/g)].map((match) => match[1]),
  ),
);

describe("translations", () => {
  it("has no key that the code never uses", () => {
    const unused = flatten(es)
      .map((key) => key.replace(/_(one|other|zero|few|many)$/, ""))
      .filter((key) => !DYNAMIC_PREFIXES.some((prefix) => key.startsWith(prefix)))
      .filter((key) => !used.has(key));
    expect([...new Set(unused)], "delete these keys from es.json and en.json").toEqual([]);
  });
});
