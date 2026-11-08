import { describe, expect, it } from "vitest";
import {
  createService,
  deleteService,
  getServiceById,
  getServices,
  updateService,
} from "../../../../src/features/services/services/servicesApi";
import {
  failServiceWrites,
  failServices,
  makeService,
  seedServices,
  storedServices,
} from "../../../handlers";

describe("getServices", () => {
  it("returns the services stored in Firestore, with the document id", async () => {
    seedServices([makeService(1), makeService(2), makeService(3)]);
    const services = await getServices();
    expect(services).toHaveLength(3);
    expect(services[0]).toEqual(makeService(1));
  });

  it("rejects when Firestore fails", async () => {
    failServices();
    await expect(getServices()).rejects.toThrow();
  });

  it("rejects with an AbortError when the request was cancelled", async () => {
    seedServices();
    const controller = new AbortController();
    controller.abort();
    await expect(getServices({ signal: controller.signal })).rejects.toMatchObject({
      name: "AbortError",
    });
  });
});

describe("getServiceById", () => {
  it("returns the service with that document id", async () => {
    seedServices([makeService(1), makeService(2)]);
    expect(await getServiceById("service-2")).toEqual(makeService(2));
  });

  it("returns null when no document has that id", async () => {
    seedServices([makeService(1)]);
    expect(await getServiceById("does-not-exist")).toBeNull();
  });

  it("rejects with an AbortError when the request was cancelled", async () => {
    seedServices();
    const controller = new AbortController();
    controller.abort();
    await expect(
      getServiceById("service-1", { signal: controller.signal }),
    ).rejects.toMatchObject({ name: "AbortError" });
  });
});

describe("createService", () => {
  it("stores the data as a new document and returns it with its id", async () => {
    seedServices([makeService(1)]);
    const { id: _id, ...data } = makeService(9);
    const created = await createService(data);
    expect(created).toEqual({ id: expect.any(String), ...data });
    expect(storedServices()).toHaveLength(2);
  });

  it("rejects when Firestore fails", async () => {
    failServiceWrites();
    const { id: _id, ...data } = makeService(9);
    await expect(createService(data)).rejects.toThrow();
  });
});

describe("updateService", () => {
  it("updates the document without creating another one", async () => {
    seedServices([makeService(1), makeService(2)]);
    const updated = await updateService("service-2", { price: 999 });
    expect(updated).toEqual({ id: "service-2", price: 999 });
    expect(storedServices()).toHaveLength(2);
    expect(storedServices().find((service) => service.id === "service-2").price).toBe(999);
  });
});

describe("deleteService", () => {
  it("removes the document", async () => {
    seedServices([makeService(1), makeService(2)]);
    await deleteService("service-1");
    expect(storedServices().map((service) => service.id)).toEqual(["service-2"]);
  });
});
