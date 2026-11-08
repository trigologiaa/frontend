import { describe, expect, it } from "vitest";
import { serviceDescription } from "../../../src/features/services/seo";
import { makeService } from "../../handlers";

describe("serviceDescription", () => {
  it("mentions the service, its price and its description", () => {
    expect(serviceDescription(makeService(1), "es")).toMatch(/^Servicio 1 · US\$\s100\. Descripción 1$/);
  });

  it("uses the active language", () => {
    expect(serviceDescription(makeService(1), "en")).toMatch(/^Service 1 · \$100\. Description 1$/);
  });

  it("is cut to 160 characters", () => {
    const service = { ...makeService(1), description: { es: "x".repeat(300), en: "x".repeat(300) } };
    const text = serviceDescription(service, "es");
    expect(text).toHaveLength(160);
    expect(text.endsWith("…")).toBe(true);
  });
});
