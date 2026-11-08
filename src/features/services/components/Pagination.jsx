import { useTranslation } from "react-i18next";
import styles from "./Pagination.module.css";

export function Pagination({ page, totalPages, onChange }) {
	const { t } = useTranslation();
	if (totalPages <= 1) return null;
	const pages = Array.from({ length: totalPages }, (_, index) => index + 1);
	return (
		<nav className={styles.nav} aria-label={t("pagination.label")}>
			<ul className={styles.list}>
				<li>
					<button
						className={styles.button}
						type="button"
						disabled={page === 1}
						onClick={() => onChange(page - 1)}
					>
						{t("pagination.previous")}
					</button>
				</li>
				{pages.map((number) => (
					<li key={number}>
						<button
							className={`${styles.button} ${styles.number}`}
							type="button"
							aria-current={number === page ? "page" : undefined}
							aria-label={t("pagination.page", { page: number })}
							onClick={() => onChange(number)}
						>
							{number}
						</button>
					</li>
				))}
				<li>
					<button
						className={styles.button}
						type="button"
						disabled={page === totalPages}
						onClick={() => onChange(page + 1)}
					>
						{t("pagination.next")}
					</button>
				</li>
			</ul>
		</nav>
	);
}
