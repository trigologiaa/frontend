export async function getProducts() {
	const response = await fetch(
		new URL("/productos.json", window.location.origin),
	);
	return response.json();
}
