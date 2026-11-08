import { useTranslation } from "react-i18next";
import styles from "./Spinner.module.css";

export function Spinner({ size = "md" }) {
	const { t } = useTranslation();
	const className = [styles.spinner, size === "sm" && styles.sm]
		.filter(Boolean)
		.join(" ");
	return (
		<span role="status" className={className}>
			<span className={styles.ring} aria-hidden="true" />
			<span className={styles.label}>{t("common.loading")}</span>
		</span>
	);
}
