import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { formatPrice } from "../../../shared/formatPrice";
import { localized } from "../../../shared/localized";
import { useLanguage } from "../../../shared/useLanguage";
import styles from "./Item.module.css";

export function Item({ service }) {
	const { t } = useTranslation();
	const language = useLanguage();
	const title = localized(service.title, language);
	return (
		<article className={styles.card}>
			<img
				className={styles.image}
				src={service.image}
				alt={title}
				loading="lazy"
				width="320"
				height="200"
			/>
			<div className={styles.body}>
				<h3 className={styles.title}>{title}</h3>
				<p className={styles.category}>{t(`categories.${service.category}`)}</p>
				<p className={styles.price}>{formatPrice(service.price, language)}</p>
				<Link
					className={styles.link}
					to={`/servicio/${service.id}`}
					aria-label={`${t("catalog.viewDetail")}: ${title}`}
				>
					{t("catalog.viewDetail")}
				</Link>
			</div>
		</article>
	);
}
