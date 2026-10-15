import { describe, expect, it } from "vitest";
import {
  getServiceById,
  getServices,
} from "../../../../src/features/services/services/servicesApi";
import {
  failingServicesHandler,
  makeService,
  servicesHandler,
} from "../../../handlers";
import { server } from "../../../server";

describe("getServices", () => {
  it("returns the services served at /services.json", async () => {
    server.use(
      servicesHandler([makeService(1), makeService(2), makeService(3)]),
    );
    const services = await getServices();
    expect(services).toHaveLength(3);
  });

  it("rejects when the server answers with an error", async () => {
    server.use(failingServicesHandler());
    await expect(getServices()).rejects.toThrow();
  });
});

describe("getServicesById", () => {
  it("returns the service with that id", async () => {
    server.use(servicesHandler([makeService(1), makeService(2)]));
    const service = await getServiceById("service-2");
    expect(service).toEqual(makeService(2));
  });

  it("returns null when no service has that id", async () => {
    server.use(servicesHandler([makeService(1)]));
    expect(await getServiceById("does-not-exist")).toBeNull();
  });
});
