import { useEffect, useState } from "react";
import { getServiceById } from "../services/servicesApi";

export function useService(id) {
	const [service, setService] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		getServiceById(id).then((data) => {
			setService(data);
			setLoading(false);
		});
	}, [id]);

	return { service, loading, error: null };
}
