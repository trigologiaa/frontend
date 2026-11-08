import { useTranslation } from "react-i18next";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { Icon } from "../../../shared/ui/Icon";
import styles from "./SearchBar.module.css";

export function SearchBar({ value, onChange }) {
	const { t } = useTranslation();
	return (
		<div className={styles.bar}>
			<label className={styles.label} htmlFor="service-search">
				{t("catalog.search")}
			</label>
			<div className={styles.field}>
				<Icon icon={FaMagnifyingGlass} className={styles.icon} />
				<input
					className={styles.input}
					id="service-search"
					type="search"
					value={value}
					onChange={(event) => onChange(event.target.value)}
				/>
			</div>
		</div>
	);
}
