import { HttpResponse, http } from "msw";

export function makeProduct(n = 1) {
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

export function productsHandler(
  products = [makeProduct(1), makeProduct(2), makeProduct(3)],
) {
  return http.get("*/productos.json", () => HttpResponse.json(products));
}

export function failingProductsHandler() {
  return http.get("*/productos.json", () =>
    HttpResponse.json({ message: "boom" }, { status: 500 }),
  );
}
