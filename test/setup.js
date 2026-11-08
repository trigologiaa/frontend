import "@testing-library/jest-dom/vitest";
import { cleanup, configure } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, beforeEach, vi } from "vitest";
import { i18n } from "../src/i18n";
import { resetFirestore } from "./fakeFirestore";
import { server } from "./server";

vi.mock("firebase/firestore", async () => (await import("./fakeFirestore")).firestoreModule);

// Lazy pages are transformed on first use: give async queries room.
configure({ asyncUtilTimeout: 5000 });

// jsdom does not implement the native <dialog> methods.
HTMLDialogElement.prototype.showModal ??= function showModal() {
  this.setAttribute("open", "");
};
HTMLDialogElement.prototype.close ??= function close() {
  this.removeAttribute("open");
  this.dispatchEvent(new Event("close"));
};

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

beforeEach(async () => {
  resetFirestore();
  await i18n.changeLanguage("es");
  localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
});

afterEach(() => {
  cleanup();
});

afterAll(() => server.close());
