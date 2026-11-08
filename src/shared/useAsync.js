import { useEffect, useState } from "react";

export function useAsync(fetcher, deps, initialData) {
	const [data, setData] = useState(initialData);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [attempt, setAttempt] = useState(0);

	// biome-ignore lint/correctness/useExhaustiveDependencies: the caller decides the dependencies
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
	}, [...deps, attempt]);

	function reload() {
		setError(null);
		setLoading(true);
		setAttempt((count) => count + 1);
	}

	return { data, loading, error, reload };
}
