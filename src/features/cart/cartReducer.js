export function cartReducer(items, action) {
	switch (action.type) {
		case "add": {
			if (!Number.isInteger(action.quantity) || action.quantity < 1)
				return items;
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
		case "remove":
			return items.filter((item) => item.id !== action.id);
		case "clear":
			return [];
		default:
			return items;
	}
}

export function selectTotalQuantity(items) {
	return items.reduce((total, item) => total + item.quantity, 0);
}

export function selectTotalPrice(items) {
	return items.reduce((total, item) => total + item.price * item.quantity, 0);
}
