import { useEffect, useState } from "react";
import { getServiceById } from "../services/servicesApi";

export function useService(id) {
	const [service, setService] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const controller = new AbortController();
		getServiceById(id, { signal: controller.signal })
			.then((data) => {
				setService(data);
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
	}, [id]);

	return { service, loading, error };
}
