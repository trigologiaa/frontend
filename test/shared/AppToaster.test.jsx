import { act, screen } from "@testing-library/react";
import { toast } from "react-toastify";
import { afterEach, describe, expect, it } from "vitest";
import { AppToaster } from "../../src/shared/AppToaster";
import { notify } from "../../src/shared/notify";
import { renderWithProviders } from "../renderWithProviders";

afterEach(() => {
  toast.dismiss();
});

describe("AppToaster", () => {
  it("shows a notice announced as an alert", async () => {
    renderWithProviders(<AppToaster />);
    act(() => {
      notify.success("toast.signedIn");
    });
    expect(await screen.findByRole("alert")).toHaveTextContent("Sesión iniciada");
  });

  it("has a button to close the notice, named in the active language", async () => {
    renderWithProviders(<AppToaster />);
    act(() => {
      notify.error("toast.error");
    });
    expect(await screen.findByRole("button", { name: "Cerrar" })).toBeInTheDocument();
  });
});
