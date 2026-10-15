import { useTranslation } from "react-i18next";
import { formatPrice } from "../../../shared/formatPrice";
import { localized } from "../../../shared/localized";
import styles from "./ItemDetail.module.css";

export function ItemDetail({ service }) {
	const { t, i18n } = useTranslation();
	const language = i18n.resolvedLanguage;
	const title = localized(service.title, language);
	return (
		<article className={styles.detail}>
			<img
				className={styles.image}
				src={service.image}
				alt={title}
				width="640"
				height="400"
			/>
			<div className={styles.info}>
				<h1 className={styles.title}>{title}</h1>
				<p className={styles.category}>{t(`categories.${service.category}`)}</p>
				<p className={styles.price}>{formatPrice(service.price, language)}</p>
				<p className={styles.description}>
					{localized(service.description, language)}
				</p>
			</div>
		</article>
	);
}
