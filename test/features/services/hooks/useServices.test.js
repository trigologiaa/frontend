import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useServices } from "../../../../src/features/services/hooks/useServices";
import { servicesHandler, failingServicesHandler } from "../../../handlers";
import { server } from "../../../server";
import { StrictMode } from "react";

describe("useServices", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("starts loading with no services and no error", () => {
    server.use(servicesHandler());
    const { result } = renderHook(() => useServices());
    expect(result.current).toEqual({
      services: [],
      loading: true,
      error: null,
    });
  });

  it("exposes the services once they are loaded", async () => {
    server.use(servicesHandler());
    const { result } = renderHook(() => useServices());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.services).toHaveLength(3);
    expect(result.current.error).toBeNull();
  });

  it("exposes an error when the services cannot be loaded", async () => {
    server.use(failingServicesHandler());
    const { result } = renderHook(() => useServices());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.services).toEqual([]);
  });

  it("aborts the pending request when the component unmounts", () => {
    server.use(servicesHandler());
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const { unmount } = renderHook(() => useServices());
    unmount();
    expect(fetchSpy.mock.calls[0][1]?.signal?.aborted).toBe(true);
  });

  it("does not report cancelled request as an error in StrictMode", async () => {
    server.use(servicesHandler());
    const { result } = renderHook(() => useServices(), { wrapper: StrictMode });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeNull();
    expect(result.current.services).toHaveLength(3);
  });
});
