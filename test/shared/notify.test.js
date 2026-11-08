import { toast } from "react-toastify";
import { describe, expect, it, vi } from "vitest";
import { i18n } from "../../src/i18n";
import { notify } from "../../src/shared/notify";

vi.mock("react-toastify", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe("notify", () => {
  it("shows a success notice with the translated text", () => {
    notify.success("toast.signedIn");
    expect(toast.success).toHaveBeenCalledWith("Sesión iniciada");
  });

  it("shows an error notice with the translated text", () => {
    notify.error("toast.error");
    expect(toast.error).toHaveBeenCalledWith("Algo salió mal. Probá de nuevo.");
  });

  it("translates with the language active at the moment of the call", async () => {
    await i18n.changeLanguage("en");
    notify.success("toast.signedOut");
    expect(toast.success).toHaveBeenLastCalledWith("Signed out");
  });
});
