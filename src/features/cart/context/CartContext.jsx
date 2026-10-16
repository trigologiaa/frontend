import { createContext, useMemo, useReducer } from "react";
import {
	cartReducer,
	selectTotalPrice,
	selectTotalQuantity,
} from "../cartReducer";

export const CartContext = createContext(null);

export function CartProvider({ children, initialItems = [] }) {
	const [items, dispatch] = useReducer(cartReducer, initialItems);

	const value = useMemo(
		() => ({
			items,
			totalQuantity: selectTotalQuantity(items),
			totalPrice: selectTotalPrice(items),
			addToCart: (service, quantity) =>
				dispatch({ type: "add", service, quantity }),
			removeFromCart: (id) => dispatch({ type: "remove", id }),
			clearCart: () => dispatch({ type: "clear" }),
		}),
		[items],
	);

	return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
