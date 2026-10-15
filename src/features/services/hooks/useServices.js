import { useAsync } from "../../../shared/useAsync";
import { getServices } from "../services/servicesApi";

export function useServices() {
	const { data: services, loading, error } = useAsync(getServices, [], []);
	return { services, loading, error };
}
