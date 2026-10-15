import { useContext } from "react";
import { CartContext } from "./CartContext";

export function useCart() {
	const value = useContext(CartContext);
	if (!value) throw new Error("useCart must be used inside a CartProvider");
	return value;
}
