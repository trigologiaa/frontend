import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "../../../shared/ui/Button";
import styles from "./ForbiddenPage.module.css";

export function ForbiddenPage() {
	const { t } = useTranslation();
	return (
		<section className={styles.page}>
			<h1 className={styles.title}>{t("auth.forbidden.title")}</h1>
			<p className={styles.hint}>{t("auth.forbidden.hint")}</p>
			<Button as={Link} to="/">
				{t("auth.forbidden.back")}
			</Button>
		</section>
	);
}
