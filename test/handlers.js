import {
  failFirestore,
  failWrites,
  readCollection,
  setCollection,
} from "./fakeFirestore";

export function makeService(n = 1) {
  return {
    id: `service-${n}`,
    title: {
      es: `Servicio ${n}`,
      en: `Service ${n}`,
    },
    description: {
      es: `Descripción ${n}`,
      en: `Description ${n}`,
    },
    price: 100 * n,
    category: "web",
    image: `/images/service-${n}.svg`,
  };
}

export function seedServices(
  services = [makeService(1), makeService(2), makeService(3)],
) {
  setCollection("services", services);
}

export function failServices() {
  failFirestore();
}

export function failServiceWrites() {
  failWrites();
}

export function storedServices() {
  return readCollection("services");
}

export function failOrderWrites() {
  failWrites();
}

export function storedOrders() {
  return readCollection("orders");
}
