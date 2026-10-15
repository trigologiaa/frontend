export function formatPrice(amount) {
	return new Intl.NumberFormat("es-AR", {
		style: "currency",
		currency: "USD",
		maximumFractionDigits: 0,
	}).format(amount);
}
