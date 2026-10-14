import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, afterAll, beforeAll } from "vitest";
import { i18n } from "../src/i18n";
import { server } from "./server";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

beforeEach(async () => {
  await i18n.changeLanguage("es");
  localStorage.clear();
});

afterEach(() => {
  cleanup();
});

afterAll(() => server.close());
