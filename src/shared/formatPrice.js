export function formatPrice(amount, language) {
	const locale = language === "en" ? "en-US" : "es-AR";
	return new Intl.NumberFormat(locale, {
		style: "currency",
		currency: "USD",
		maximumFractionDigits: 0,
	}).format(amount);
}
