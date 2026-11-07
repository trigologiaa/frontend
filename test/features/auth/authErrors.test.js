import { describe, it, expect } from "vitest";
import { authErrorKey } from "../../../src/features/auth/authErrors";

describe("authErrorKey", () => {
  it.each([
    ["auth/email-already-in-use", "auth.errors.emailInUse"],
    ["auth/weak-password", "auth.errors.weakPassword"],
    ["auth/invalid-email", "auth.errors.invalidEmail"],
    ["auth/network-request-failed", "auth.errors.network"],
    ["auth/invalid-credential", "auth.errors.invalidCredentials"],
    ["auth/wrong-password", "auth.errors.invalidCredentials"],
    ["auth/user-not-found", "auth.errors.invalidCredentials"],
  ])("maps %s to %s", (code, key) => {
    expect(authErrorKey(code)).toBe(key);
  });

  it("falls back to a generic message for an unknown code", () => {
    expect(authErrorKey("auth/something-new")).toBe("auth.errors.generic");
    expect(authErrorKey(undefined)).toBe("auth.errors.generic");
  });
});
