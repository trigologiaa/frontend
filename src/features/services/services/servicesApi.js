export async function getServices({ signal } = {}) {
	const response = await fetch(
		new URL("/productos.json", window.location.origin),
		{ signal },
	);
	if (!response.ok) {
		throw new Error(`Could not load the services ${response.status}`);
	}
	return response.json();
}

export async function getServiceById(id) {
	const services = await getServices();
	return services.find((service) => service.id === id) ?? null;
}
