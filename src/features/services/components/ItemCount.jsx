import { useTranslation } from "react-i18next";

export function ItemCount({ value, onChange }) {
	const { t } = useTranslation();
	return (
		<div>
			<output aria-label={t("detail.quantity")}>{value}</output>
			<button
				type="button"
				aria-label={t("detail.increase")}
				onClick={() => onChange(value + 1)}
			>
				+
			</button>
		</div>
	);
}
