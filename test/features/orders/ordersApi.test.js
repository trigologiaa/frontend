import { describe, expect, it } from "vitest";
import { createOrder } from "../../../src/features/orders/ordersApi";
import { failOrderWrites, storedOrders } from "../../handlers";

const order = {
  buyer: { name: "Ana", email: "ana@example.com", phone: "+54 11 5555 5555" },
  items: [{ id: "service-1", title: { es: "Servicio 1", en: "Service 1" }, price: 100, quantity: 2 }],
  total: 200,
};

describe("createOrder", () => {
  it("stores the order with a server timestamp and returns its id", async () => {
    const id = await createOrder(order);
    expect(storedOrders()).toEqual([{ id, ...order, createdAt: "server-timestamp" }]);
  });

  it("rejects when Firestore fails", async () => {
    failOrderWrites();
    await expect(createOrder(order)).rejects.toThrow();
  });
});
