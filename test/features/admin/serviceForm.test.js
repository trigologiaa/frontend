import { describe, expect, it } from "vitest";
import {
  EMPTY_VALUES,
  toFormValues,
  toServiceData,
  validateService,
} from "../../../src/features/admin/serviceForm";
import { makeService } from "../../handlers";

const valid = {
  titleEs: "Sitio",
  titleEn: "Site",
  descriptionEs: "Un sitio",
  descriptionEn: "A site",
  price: "250",
  category: "web",
  image: "https://example.com/a.png",
};

describe("toServiceData", () => {
  it("builds the service document from the form values", () => {
    expect(toServiceData({ ...valid, titleEs: "  Sitio  " })).toEqual({
      title: { es: "Sitio", en: "Site" },
      description: { es: "Un sitio", en: "A site" },
      price: 250,
      category: "web",
      image: "https://example.com/a.png",
    });
  });
});

describe("toFormValues", () => {
  it("is the inverse of toServiceData", () => {
    const { id, ...data } = makeService(2);
    expect(toServiceData(toFormValues({ id, ...data }))).toEqual(data);
  });
});

describe("validateService", () => {
  it("returns no errors for valid values", () => {
    expect(validateService(valid)).toEqual({});
  });

  it("accepts a path of the site as the image", () => {
    expect(validateService({ ...valid, image: "/images/a.svg" })).toEqual({});
  });

  it("rejects an empty form field by field", () => {
    expect(validateService(EMPTY_VALUES)).toEqual({
      titleEs: "admin.errors.required",
      titleEn: "admin.errors.required",
      descriptionEs: "admin.errors.required",
      descriptionEn: "admin.errors.required",
      price: "admin.errors.price",
      image: "admin.errors.image",
    });
  });

  it.each(["0", "-5", "abc"])("rejects the price %s", (price) => {
    expect(validateService({ ...valid, price }).price).toBe("admin.errors.price");
  });

  it("rejects an unknown category", () => {
    expect(validateService({ ...valid, category: "other" }).category).toBe(
      "admin.errors.category",
    );
  });

  it("rejects an image that is not https or a site path", () => {
    expect(validateService({ ...valid, image: "http://example.com/a.png" }).image).toBe(
      "admin.errors.image",
    );
  });
});
