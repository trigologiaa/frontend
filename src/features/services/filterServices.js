import { localized } from "../../shared/localized";

function normalize(text) {
	return text
		.normalize("NFD")
		.replace(/\p{Diacritic}/gu, "")
		.toLowerCase()
		.trim();
}

export function filterServices(
	services,
	term,
	language,
	categoryName = () => "",
) {
	const wanted = normalize(term);
	if (!wanted) return services;
	return services.filter((service) => {
		const haystack = [
			localized(service.title, language),
			categoryName(service.category),
		].map(normalize);
		return haystack.some((text) => text.includes(wanted));
	});
}
