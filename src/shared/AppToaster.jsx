import { useTranslation } from "react-i18next";
import { ToastContainer } from "react-toastify";
import styles from "./AppToaster.module.css";

export function AppToaster() {
	const { t } = useTranslation();
	return (
		<ToastContainer
			className={styles.container}
			position="bottom-right"
			autoClose={4000}
			closeButton={({ closeToast }) => (
				<button
					type="button"
					className={styles.close}
					aria-label={t("toast.close")}
					onClick={closeToast}
				>
					×
				</button>
			)}
		/>
	);
}
