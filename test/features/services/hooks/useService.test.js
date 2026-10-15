import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useService } from "../../../../src/features/services/hooks/useService";
import { servicesHandler } from "../../../handlers";
import { server } from "../../../server";

describe("useService", () => {
  it("starts loading with no service and no error", () => {
    server.use(servicesHandler());
    const { result } = renderHook(() => useService("service-1"));
    expect(result.current).toEqual({ service: null, loading: true, error: null });
  });
});
