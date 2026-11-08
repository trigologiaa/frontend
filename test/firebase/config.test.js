import { beforeEach, describe, expect, it, vi } from "vitest";

const firebaseApp = vi.hoisted(() => ({ initializeApp: vi.fn(() => "app") }));
const firebaseAuth = vi.hoisted(() => ({ getAuth: vi.fn(() => "auth") }));
const firebaseFirestore = vi.hoisted(() => ({ getFirestore: vi.fn(() => "db") }));

vi.mock("firebase/app", () => firebaseApp);
vi.mock("firebase/auth", () => firebaseAuth);
vi.mock("firebase/firestore", () => firebaseFirestore);

async function loadConfig(apiKey) {
  vi.stubEnv("VITE_FIREBASE_API_KEY", apiKey);
  vi.resetModules();
  return import("../../src/firebase/config");
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("firebase config", () => {
  it("exports nothing to talk to when there is no API key", async () => {
    const config = await loadConfig("");
    expect(config.auth).toBeNull();
    expect(config.db).toBeNull();
    expect(firebaseApp.initializeApp).not.toHaveBeenCalled();
  });

  it("initializes the app, auth and firestore from the environment", async () => {
    const config = await loadConfig("key");
    expect(firebaseApp.initializeApp).toHaveBeenCalledWith(
      expect.objectContaining({ apiKey: "key" }),
    );
    expect(config.auth).toBe("auth");
    expect(config.db).toBe("db");
  });
});
