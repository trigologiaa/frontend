import { HttpResponse, http } from "msw";

export function makeService(n = 1) {
  return {
    id: `service-${n}`,
    title: {
      es: `Descripción ${n}`,
      en: `Description ${n}`,
    },
    price: 100 * n,
    category: "web",
    image: `/images/service-${n}.svg`,
  };
}

export function servicesHandler(
  services = [makeService(1), makeService(2), makeService(3)],
) {
  return http.get("*/servicios.json", () => HttpResponse.json(services));
}

export function failingServicesHandler() {
  return http.get("*/servicios.json", () =>
    HttpResponse.json({ message: "boom" }, { status: 500 }),
  );
}
