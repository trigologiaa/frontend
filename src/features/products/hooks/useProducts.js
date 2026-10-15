import { useEffect, useState } from "react";
import { getProducts } from "../services/productsApi";

export function useProducts() {
	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	useEffect(() => {
		getProducts()
			.then((data) => {
				setProducts(data);
				setLoading(false);
			})
			.catch((err) => {
				setError(err);
				setLoading(false);
			});
	}, []);
	return { products, loading, error };
}
