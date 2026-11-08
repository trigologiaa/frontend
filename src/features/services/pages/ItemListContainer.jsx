import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { Seo } from "../../../shared/Seo";
import { Spinner } from "../../../shared/Spinner";
import { Button } from "../../../shared/ui/Button";
import { useLanguage } from "../../../shared/useLanguage";
import { ItemList } from "../components/ItemList";
import { Pagination } from "../components/Pagination";
import { SearchBar } from "../components/SearchBar";
import { filterServices } from "../filterServices";
import { useServices } from "../hooks/useServices";
import { paginate } from "../paginate";
import styles from "./ItemListContainer.module.css";

const PAGE_SIZE = 6;

export function ItemListContainer() {
	const { t } = useTranslation();
	const language = useLanguage();
	const { services, loading, error, reload } = useServices();
	const [params, setParams] = useSearchParams();
	const titleRef = useRef(null);
	const term = params.get("q") ?? "";

	function setTerm(value) {
		setParams(value ? { q: value } : {}, { replace: true });
	}

	function setPage(next) {
		const nextParams = {};
		if (term) nextParams.q = term;
		if (next > 1) nextParams.page = String(next);
		setParams(nextParams);
		titleRef.current.focus();
	}

	const visible = filterServices(services, term, language, (category) =>
		t(`categories.${category}`),
	);
	const {
		items: pageItems,
		page,
		totalPages,
	} = paginate(visible, Number(params.get("page")), PAGE_SIZE);

	let body;
	if (loading) {
		body = (
			<div className={styles.status}>
				<Spinner />
			</div>
		);
	} else if (error) {
		body = (
			<div className={styles.alert} role="alert">
				<p>{t("catalog.error")}</p>
				<Button variant="secondary" onClick={reload}>
					{t("common.retry")}
				</Button>
			</div>
		);
	} else if (services.length === 0) {
		body = <p className={styles.empty}>{t("catalog.empty")}</p>;
	} else if (visible.length === 0) {
		body = (
			<div role="status">
				<p className={styles.empty}>{t("catalog.noResults", { term })}</p>
				<Button variant="secondary" onClick={() => setTerm("")}>
					{t("catalog.clear")}
				</Button>
			</div>
		);
	} else {
		body = (
			<>
				<ItemList services={pageItems} />
				<Pagination page={page} totalPages={totalPages} onChange={setPage} />
			</>
		);
	}

	return (
		<section className={styles.page}>
			<Seo
				title={t("seo.services.title")}
				description={t("seo.services.description")}
			/>
			<h1 ref={titleRef} tabIndex={-1} className={styles.title}>
				{t("nav.services")}
			</h1>
			<SearchBar value={term} onChange={setTerm} />
			{term && !loading && !error && visible.length > 0 && (
				<p className={styles.count} role="status">
					{t("catalog.count", { count: visible.length })}
				</p>
			)}
			{body}
		</section>
	);
}
