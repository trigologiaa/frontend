export async function getProducts() {
	const response = await fetch(
		new URL("/productos.json", window.location.origin),
	);
	if (!response.ok) {
		throw new Error(`Could not load the products ${response.status}`);
	}
	return response.json();
}

export async function getProductById(id) {
	const products = await getProducts();
	return products.find((product) => product.id === id);
}
