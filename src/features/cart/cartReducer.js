export function cartReducer(items, action) {
	const { id, title, price, image } = action.service;
	return [...items, { id, title, price, image, quantity: action.quantity }];
}
