import { describe, expect, it } from "vitest";
import { filterServices } from "../../../src/features/services/filterServices";
import { makeService } from "../../handlers";

const react = {
  ...makeService(1),
  title: { es: "Aplicación React", en: "React app" },
  category: "web",
};
const review = {
  ...makeService(2),
  title: { es: "Revisión de código", en: "Code review" },
  category: "mentoring",
};
const services = [react, review];

describe("filterServices", () => {
  it("returns every service for an empty term", () => {
    expect(filterServices(services, "", "es")).toEqual(services);
    expect(filterServices(services, "   ", "es")).toEqual(services);
  });

  it("matches the title in the active language", () => {
    expect(filterServices(services, "react", "es")).toEqual([react]);
  });

  it("ignores case and accents", () => {
    expect(filterServices(services, "REVISION", "es")).toEqual([review]);
    expect(filterServices(services, "codigo", "es")).toEqual([review]);
  });

  it("uses the title of the active language", () => {
    expect(filterServices(services, "code review", "en")).toEqual([review]);
    expect(filterServices(services, "code review", "es")).toEqual([]);
  });

  it("also matches the category name", () => {
    const names = {
      es: { web: "Web", mentoring: "Mentoría" },
      en: { web: "Web", mentoring: "Mentoring" },
    };
    expect(filterServices(services, "mentoría", "es", (c) => names.es[c])).toEqual([review]);
    expect(filterServices(services, "mentoring", "en", (c) => names.en[c])).toEqual([review]);
  });

  it("matches only the title when no category name is given", () => {
    expect(filterServices(services, "mentoring", "en")).toEqual([]);
  });
});
