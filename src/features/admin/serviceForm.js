export const CATEGORIES = ["web", "backend", "mentoring", "devops"];

export const EMPTY_VALUES = {
	titleEs: "",
	titleEn: "",
	descriptionEs: "",
	descriptionEn: "",
	price: "",
	category: "web",
	image: "",
};

export function toServiceData(values) {
	return {
		title: { es: values.titleEs.trim(), en: values.titleEn.trim() },
		description: {
			es: values.descriptionEs.trim(),
			en: values.descriptionEn.trim(),
		},
		price: Number(values.price),
		category: values.category,
		image: values.image.trim(),
	};
}

export function toFormValues(service) {
	return {
		titleEs: service.title.es,
		titleEn: service.title.en,
		descriptionEs: service.description.es,
		descriptionEn: service.description.en,
		price: String(service.price),
		category: service.category,
		image: service.image,
	};
}

export function validateService(values) {
	const errors = {};
	for (const field of [
		"titleEs",
		"titleEn",
		"descriptionEs",
		"descriptionEn",
	]) {
		if (!values[field].trim()) errors[field] = "admin.errors.required";
	}
	const price = Number(values.price);
	if (values.price.trim() === "" || !Number.isFinite(price) || price <= 0) {
		errors.price = "admin.errors.price";
	}
	if (!CATEGORIES.includes(values.category)) {
		errors.category = "admin.errors.category";
	}
	if (!/^(https:\/\/|\/)\S+$/.test(values.image.trim())) {
		errors.image = "admin.errors.image";
	}
	return errors;
}
