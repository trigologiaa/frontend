export function cartReducer(items, action) {
	switch (action.type) {
		case "add": {
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
