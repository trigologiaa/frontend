import { beforeEach, describe, expect, it, vi } from "vitest";

const firebaseApp = vi.hoisted(() => ({ initializeApp: vi.fn(() => "app") }));
const firebaseAuth = vi.hoisted(() => ({
  getAuth: vi.fn(() => "auth"),
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
}));

vi.mock("firebase/app", () => firebaseApp);
vi.mock("firebase/auth", () => firebaseAuth);

async function loadApi(apiKey) {
  vi.stubEnv("VITE_FIREBASE_API_KEY", apiKey);
  vi.resetModules();
  return (await import("../../../src/features/auth/authApi")).authApi;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("authApi without a Firebase API key", () => {
  it("reports an anonymous user and returns a no-op unsubscribe", async () => {
    const api = await loadApi("");
    const callback = vi.fn();
    const unsubscribe = api.onAuthChange(callback);
    expect(callback).toHaveBeenCalledWith(null);
    expect(unsubscribe()).toBeUndefined();
    expect(firebaseApp.initializeApp).not.toHaveBeenCalled();
  });

  it("rejects the operations with a configuration error code", async () => {
    const api = await loadApi("");
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

describe("authApi with a Firebase API key", () => {
  it("creates the account and returns only uid and email", async () => {
    firebaseAuth.createUserWithEmailAndPassword.mockResolvedValue({
      user: { uid: "u1", email: "a@b.co", secret: "x" },
    });
    const api = await loadApi("key");
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

  it("signs in and reuses the same Firebase auth instance", async () => {
    firebaseAuth.signInWithEmailAndPassword.mockResolvedValue({
      user: { uid: "u1", email: "a@b.co" },
    });
    const api = await loadApi("key");
    await api.signIn("a@b.co", "secret1");
    await api.signIn("a@b.co", "secret1");
    expect(firebaseAuth.getAuth).toHaveBeenCalledTimes(1);
    expect(firebaseApp.initializeApp).toHaveBeenCalledWith(
      expect.objectContaining({ apiKey: "key" }),
    );
  });

  it("signs out", async () => {
    const api = await loadApi("key");
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
    const api = await loadApi("key");
    const callback = vi.fn();
    expect(api.onAuthChange(callback)).toBe(unsubscribe);
    expect(callback).toHaveBeenNthCalledWith(1, { uid: "u1", email: "a@b.co" });
    expect(callback).toHaveBeenNthCalledWith(2, null);
  });
});
