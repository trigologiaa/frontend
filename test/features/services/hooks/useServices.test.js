import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useServices } from "../../../../src/features/services/hooks/useServices";
import { failServices, makeService, seedServices } from "../../../handlers";
import { StrictMode } from "react";
import { getServices } from "../../../../src/features/services/services/servicesApi";

vi.mock("../../../../src/features/services/services/servicesApi", { spy: true });

describe("useServices", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("starts loading with no services and no error", () => {
    seedServices();
    const { result } = renderHook(() => useServices());
    expect(result.current).toEqual({
      services: [],
      loading: true,
      error: null,
      reload: expect.any(Function),
    });
  });

  it("exposes the services once they are loaded", async () => {
    seedServices();
    const { result } = renderHook(() => useServices());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.services).toHaveLength(3);
    expect(result.current.error).toBeNull();
  });

  it("exposes an error when the services cannot be loaded", async () => {
    failServices();
    const { result } = renderHook(() => useServices());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.services).toEqual([]);
  });

  it("aborts the pending request when the component unmounts", () => {
    seedServices();
    const { unmount } = renderHook(() => useServices());
    unmount();
    expect(vi.mocked(getServices).mock.calls[0][0].signal.aborted).toBe(true);
  });

  it("does not report cancelled request as an error in StrictMode", async () => {
    seedServices();
    const { result } = renderHook(() => useServices(), { wrapper: StrictMode });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeNull();
    expect(result.current.services).toHaveLength(3);
  });

  it("loads the services again when the reload key changes", async () => {
    seedServices([makeService(1)]);
    const { result, rerender } = renderHook(({ key }) => useServices(key), {
      initialProps: { key: 0 },
    });
    await waitFor(() => expect(result.current.services).toHaveLength(1));
    seedServices([makeService(1), makeService(2)]);
    rerender({ key: 1 });
    await waitFor(() => expect(result.current.services).toHaveLength(2));
  });
});
