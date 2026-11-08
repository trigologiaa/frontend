export function paginate(items, page, pageSize) {
	const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
	const wanted = Number.isInteger(page) && page >= 1 ? page : 1;
	const current = Math.min(wanted, totalPages);
	const start = (current - 1) * pageSize;
	return {
		items: items.slice(start, start + pageSize),
		page: current,
		totalPages,
	};
}
