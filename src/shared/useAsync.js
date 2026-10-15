import { useEffect, useState } from "react";

export function useAsync(fetcher, deps, initialData) {
	const [data, setData] = useState(initialData);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const controller = new AbortController();
		fetcher({ signal: controller.signal })
			.then((result) => {
				setData(result);
				setLoading(false);
			})
			.catch((err) => {
				if (err.name === "AbortError") return;
				setError(err);
				setLoading(false);
			});
		return () => controller.abort();
		// biome-ignore lint/correctness/useExhaustiveDependencies: the caller decides the dependencies
	}, deps);

	return { data, loading, error };
}
