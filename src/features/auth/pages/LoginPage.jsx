import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { notify } from "../../../shared/notify";
import { Seo } from "../../../shared/Seo";
import { Button } from "../../../shared/ui/Button";
import { authErrorKey } from "../authErrors";
import { useAuth } from "../context/useAuth";
import styles from "./LoginPage.module.css";

const ERROR_ID = "login-error";

export function LoginPage() {
	const { t } = useTranslation();
	const { user, signIn } = useAuth();
	const navigate = useNavigate();
	const returnTo = useLocation().state?.returnTo ?? "/";
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [errorKey, setErrorKey] = useState(null);
	const [submitting, setSubmitting] = useState(false);

	if (user) return <Navigate to={returnTo} replace />;

	async function handleSubmit(event) {
		event.preventDefault();
		setErrorKey(null);
		setSubmitting(true);
		try {
			await signIn(email, password);
			notify.success("toast.signedIn");
			navigate(returnTo, { replace: true });
		} catch (error) {
			setErrorKey(authErrorKey(error?.code));
		} finally {
			setSubmitting(false);
		}
	}

	const describedBy = errorKey ? ERROR_ID : undefined;
	return (
		<section className={styles.page}>
			<Seo
				title={t("seo.login.title")}
				description={t("seo.login.description")}
			/>
			<h1 className={styles.title}>{t("auth.login.title")}</h1>
			<form className={styles.form} onSubmit={handleSubmit}>
				<div className={styles.field}>
					<label htmlFor="login-email">{t("auth.email")}</label>
					<input
						id="login-email"
						className={styles.input}
						type="email"
						autoComplete="email"
						required
						value={email}
						aria-describedby={describedBy}
						onChange={(event) => setEmail(event.target.value)}
					/>
				</div>
				<div className={styles.field}>
					<label htmlFor="login-password">{t("auth.password")}</label>
					<input
						id="login-password"
						className={styles.input}
						type="password"
						autoComplete="current-password"
						required
						value={password}
						aria-describedby={describedBy}
						onChange={(event) => setPassword(event.target.value)}
					/>
				</div>
				{errorKey && (
					<p id={ERROR_ID} className={styles.error} role="alert">
						{t(errorKey)}
					</p>
				)}
				<Button type="submit" size="lg" disabled={submitting}>
					{t("auth.login.submit")}
				</Button>
			</form>
			<p className={styles.alternative}>
				{t("auth.login.noAccount")}{" "}
				<Link to="/registro">{t("nav.register")}</Link>
			</p>
		</section>
	);
}
