export const EMPTY_BUYER = { name: "", email: "", phone: "" };

export function validateBuyer(values) {
	const errors = {};
	if (!values.name.trim()) errors.name = "checkout.errors.name";
	if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) {
		errors.email = "checkout.errors.email";
	}
	if (!/^\+?[\d\s()-]{6,}$/.test(values.phone.trim())) {
		errors.phone = "checkout.errors.phone";
	}
	return errors;
}
