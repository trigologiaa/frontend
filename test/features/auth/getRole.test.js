import { describe, expect, it } from "vitest";
import { authApi } from "../../../src/features/auth/authApi";
import { failFirestore, setCollection } from "../../fakeFirestore";

describe("authApi.getRole", () => {
  it("is admin when the user document says so", async () => {
    setCollection("usuarios", [{ id: "uid-1", rol: "admin" }]);
    expect(await authApi.getRole("uid-1")).toBe("admin");
  });

  it("is a regular user when there is no document", async () => {
    setCollection("usuarios", []);
    expect(await authApi.getRole("uid-1")).toBe("user");
  });

  it("is a regular user for any other value", async () => {
    setCollection("usuarios", [{ id: "uid-1", rol: "superuser" }]);
    expect(await authApi.getRole("uid-1")).toBe("user");
  });

  it("is a regular user when reading fails", async () => {
    failFirestore();
    expect(await authApi.getRole("uid-1")).toBe("user");
  });
});
