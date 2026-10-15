import { useEffect, useState } from "react";
import { getServices } from "../services/servicesApi";

export function useServices() {
	const [services, setServices] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	useEffect(() => {
		const controller = new AbortController();
		getServices({ signal: controller.signal })
			.then((data) => {
				setServices(data);
				setLoading(false);
			})
			.catch((err) => {
				if (err.name === "AbortError") {
					return;
				}
				setError(err);
				setLoading(false);
			});
		return () => controller.abort();
	}, []);
	return { services, loading, error };
}
