import { describe, expect, it } from "vitest";
import { EMPTY_BUYER, validateBuyer } from "../../../src/features/cart/checkoutValidation";

const valid = { name: "Ana", email: "ana@example.com", phone: "+54 11 5555-5555" };

describe("validateBuyer", () => {
  it("returns no errors for valid data", () => {
    expect(validateBuyer(valid)).toEqual({});
  });

  it("reports each empty field", () => {
    expect(validateBuyer(EMPTY_BUYER)).toEqual({
      name: "checkout.errors.name",
      email: "checkout.errors.email",
      phone: "checkout.errors.phone",
    });
  });

  it.each(["ana", "ana@", "ana@example", "a b@example.com"])("rejects the email %s", (email) => {
    expect(validateBuyer({ ...valid, email }).email).toBe("checkout.errors.email");
  });

  it.each(["abc", "123", "12-ab-56"])("rejects the phone %s", (phone) => {
    expect(validateBuyer({ ...valid, phone }).phone).toBe("checkout.errors.phone");
  });
});
