export async function getServices({ signal } = {}) {
	const response = await fetch(
		new URL("/servicios.json", window.location.origin),
		{ signal },
	);
	if (!response.ok) {
		throw new Error(`Could not load the services ${response.status}`);
	}
	return response.json();
}

export async function getServiceById(id, { signal } = {}) {
	const services = await getServices({ signal });
	return services.find((service) => service.id === id) ?? null;
}
