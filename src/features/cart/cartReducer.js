export function cartReducer(items, action) {
	const { id, title, price, image } = action.service;
	const existing = items.find((item) => item.id === id);
	if (existing) {
		return items.map((item) =>
			item.id === id
				? { ...item, quantity: item.quantity + action.quantity }
				: item,
		);
	}
	return [...items, { id, title, price, image, quantity: action.quantity }];
}
