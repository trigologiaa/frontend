import { useTranslation } from "react-i18next";
import { formatPrice } from "../../../shared/formatPrice";
import { localized } from "../../../shared/localized";
import { useLanguage } from "../../../shared/useLanguage";
import styles from "./CartItem.module.css";

export function CartItem({ item, onRemove }) {
	const { t } = useTranslation();
	const language = useLanguage();
	const title = localized(item.title, language);
	return (
		<article className={styles.item}>
			<img
				className={styles.image}
				src={item.image}
				alt={title}
				width="80"
				height="80"
			/>
			<div className={styles.info}>
				<h3 className={styles.title}>{title}</h3>
				<p className={styles.detail}>
					{t("cart.quantity")}: {item.quantity}
				</p>
				<p className={styles.detail}>
					{t("cart.unitPrice")}: {formatPrice(item.price, language)}
				</p>
				<p className={styles.subtotal}>
					{t("cart.subtotal")}:{" "}
					{formatPrice(item.price * item.quantity, language)}
				</p>
			</div>
			<button
				className={styles.remove}
				type="button"
				aria-label={`${t("cart.remove")} ${title}`}
				onClick={() => onRemove(item.id)}
			>
				{t("cart.remove")}
			</button>
		</article>
	);
}
