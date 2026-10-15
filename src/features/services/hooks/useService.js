import { useAsync } from "../../../shared/useAsync";
import { getServiceById } from "../services/servicesApi";

export function useService(id) {
	const {
		data: service,
		loading,
		error,
	} = useAsync((options) => getServiceById(id, options), [id], null);
	return { service, loading, error };
}
