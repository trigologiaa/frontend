import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useService } from "../../../../src/features/services/hooks/useService";
import { makeService, servicesHandler } from "../../../handlers";
import { server } from "../../../server";

describe("useService", () => {
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
});
