import { useTranslation } from "react-i18next";
import styles from "./ItemCount.module.css";

export function ItemCount({ value, onChange }) {
	const { t } = useTranslation();
	return (
		<div className={styles.counter}>
			<button
				className={styles.button}
				type="button"
				aria-label={t("detail.decrease")}
				disabled={value <= 1}
				onClick={() => onChange(value - 1)}
			>
				−
			</button>
			<output className={styles.value} aria-label={t("detail.quantity")}>
				{value}
			</output>
			<button
				className={styles.button}
				type="button"
				aria-label={t("detail.increase")}
				onClick={() => onChange(value + 1)}
			>
				+
			</button>
		</div>
	);
}
