import { useAsync } from "../../../shared/useAsync";
import { getServices } from "../services/servicesApi";

export function useServices(reloadKey = 0) {
	const {
		data: services,
		loading,
		error,
		reload,
	} = useAsync(getServices, [reloadKey], []);
	return { services, loading, error, reload };
}
