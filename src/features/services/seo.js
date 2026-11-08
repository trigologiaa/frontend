import { formatPrice } from "../../shared/formatPrice";
import { localized } from "../../shared/localized";

const MAX_LENGTH = 160;

export function serviceDescription(service, language) {
	const text = `${localized(service.title, language)} · ${formatPrice(service.price, language)}. ${localized(service.description, language)}`;
	return text.length > MAX_LENGTH ? `${text.slice(0, MAX_LENGTH - 1)}…` : text;
}
