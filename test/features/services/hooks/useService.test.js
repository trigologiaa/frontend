import { StrictMode } from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useService } from "../../../../src/features/services/hooks/useService";
import { getServiceById } from "../../../../src/features/services/services/servicesApi";
import {
  failServices,
  makeService,
  seedServices,
} from "../../../handlers";

vi.mock("../../../../src/features/services/services/servicesApi", { spy: true });

describe("useService", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("starts loading with no service and no error", () => {
    seedServices();
    const { result } = renderHook(() => useService("service-1"));
    expect(result.current).toEqual({
      service: null,
      loading: true,
      error: null,
      reload: expect.any(Function),
    });
  });

  it("loads the service with the requested id", async () => {
    seedServices([makeService(1), makeService(2)]);
    const { result } = renderHook(() => useService("service-2"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.service).toEqual(makeService(2));
  });

  it("returns no service and no error for an unknown id", async () => {
    seedServices([makeService(1)]);
    const { result } = renderHook(() => useService("does-not-exist"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.service).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("exposes an error when the service cannot be loaded", async () => {
    failServices();
    const { result } = renderHook(() => useService("service-1"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.service).toBeNull();
  });

  it("aborts the pending request when the component unmounts", () => {
    seedServices();
    const { unmount } = renderHook(() => useService("service-1"));
    unmount();
    expect(vi.mocked(getServiceById).mock.calls[0][1].signal.aborted).toBe(true);
  });

  it("does not report a cancelled request as an error in StrictMode", async () => {
    seedServices([makeService(1)]);
    const { result } = renderHook(() => useService("service-1"), {
      wrapper: StrictMode,
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeNull();
    expect(result.current.service).toEqual(makeService(1));
  });
});
