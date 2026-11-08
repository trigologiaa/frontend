import { beforeEach, describe, expect, it, vi } from "vitest";

const firebaseAuth = vi.hoisted(() => ({
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
}));

vi.mock("firebase/auth", () => firebaseAuth);

async function loadApi(auth) {
  vi.resetModules();
  vi.doMock("../../../src/firebase/config", () => ({ auth }));
  return (await import("../../../src/features/auth/authApi")).authApi;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("authApi without a Firebase configuration", () => {
  it("reports an anonymous user and returns a no-op unsubscribe", async () => {
    const api = await loadApi(null);
    const callback = vi.fn();
    const unsubscribe = api.onAuthChange(callback);
    expect(callback).toHaveBeenCalledWith(null);
    expect(unsubscribe()).toBeUndefined();
  });

  it("rejects the operations with a configuration error code", async () => {
    const api = await loadApi(null);
    await expect(api.signUp("a@b.co", "secret1")).rejects.toEqual({
      code: "auth/configuration-not-found",
    });
    await expect(api.signIn("a@b.co", "secret1")).rejects.toEqual({
      code: "auth/configuration-not-found",
    });
    await expect(api.signOut()).rejects.toEqual({
      code: "auth/configuration-not-found",
    });
  });
});

describe("authApi with a Firebase configuration", () => {
  it("creates the account and returns only uid and email", async () => {
    firebaseAuth.createUserWithEmailAndPassword.mockResolvedValue({
      user: { uid: "u1", email: "a@b.co", secret: "x" },
    });
    const api = await loadApi("auth");
    await expect(api.signUp("a@b.co", "secret1")).resolves.toEqual({
      uid: "u1",
      email: "a@b.co",
    });
    expect(firebaseAuth.createUserWithEmailAndPassword).toHaveBeenCalledWith(
      "auth",
      "a@b.co",
      "secret1",
    );
  });

  it("signs in", async () => {
    firebaseAuth.signInWithEmailAndPassword.mockResolvedValue({
      user: { uid: "u1", email: "a@b.co" },
    });
    const api = await loadApi("auth");
    await expect(api.signIn("a@b.co", "secret1")).resolves.toEqual({
      uid: "u1",
      email: "a@b.co",
    });
  });

  it("signs out", async () => {
    const api = await loadApi("auth");
    await api.signOut();
    expect(firebaseAuth.signOut).toHaveBeenCalledWith("auth");
  });

  it("forwards auth changes mapped to plain users and returns the unsubscribe", async () => {
    const unsubscribe = vi.fn();
    firebaseAuth.onAuthStateChanged.mockImplementation((_auth, listener) => {
      listener({ uid: "u1", email: "a@b.co" });
      listener(null);
      return unsubscribe;
    });
    const api = await loadApi("auth");
    const callback = vi.fn();
    expect(api.onAuthChange(callback)).toBe(unsubscribe);
    expect(callback).toHaveBeenNthCalledWith(1, { uid: "u1", email: "a@b.co" });
    expect(callback).toHaveBeenNthCalledWith(2, null);
  });
});
