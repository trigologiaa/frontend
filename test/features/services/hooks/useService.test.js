import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useService } from "../../../../src/features/services/hooks/useService";
import {
  failingServicesHandler,
  makeService,
  servicesHandler,
} from "../../../handlers";
import { server } from "../../../server";

describe("useService", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("starts loading with no service and no error", () => {
    server.use(servicesHandler());
    const { result } = renderHook(() => useService("service-1"));
    expect(result.current).toEqual({ service: null, loading: true, error: null });
  });

  it("loads the service with the requested id", async () => {
    server.use(servicesHandler([makeService(1), makeService(2)]));
    const { result } = renderHook(() => useService("service-2"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.service).toEqual(makeService(2));
  });

  it("returns no service and no error for an unknown id", async () => {
    server.use(servicesHandler([makeService(1)]));
    const { result } = renderHook(() => useService("does-not-exist"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.service).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("exposes an error when the service cannot be loaded", async () => {
    server.use(failingServicesHandler());
    const { result } = renderHook(() => useService("service-1"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.service).toBeNull();
  });

  it("aborts the pending request when the component unmounts", () => {
    server.use(servicesHandler());
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const { unmount } = renderHook(() => useService("service-1"));
    unmount();
    expect(fetchSpy.mock.calls[0][1]?.signal?.aborted).toBe(true);
  });
});
