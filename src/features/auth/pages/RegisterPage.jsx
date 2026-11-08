import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Seo } from "../../../shared/Seo";
import { Button } from "../../../shared/ui/Button";
import { authErrorKey } from "../authErrors";
import { useAuth } from "../context/useAuth";
import styles from "./RegisterPage.module.css";

const ERROR_ID = "register-error";

export function RegisterPage() {
	const { t } = useTranslation();
	const { user, signUp } = useAuth();
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirm, setConfirm] = useState("");
	const [errorKey, setErrorKey] = useState(null);
	const [submitting, setSubmitting] = useState(false);

	if (user) return <Navigate to="/" replace />;

	async function handleSubmit(event) {
		event.preventDefault();
		if (password !== confirm) {
			setErrorKey("auth.errors.mismatch");
			return;
		}
		setErrorKey(null);
		setSubmitting(true);
		try {
			await signUp(email, password);
			navigate("/");
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
				title={t("seo.register.title")}
				description={t("seo.register.description")}
			/>
			<h1 className={styles.title}>{t("auth.register.title")}</h1>
			<form className={styles.form} onSubmit={handleSubmit}>
				<div className={styles.field}>
					<label htmlFor="register-email">{t("auth.email")}</label>
					<input
						id="register-email"
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
					<label htmlFor="register-password">{t("auth.password")}</label>
					<input
						id="register-password"
						className={styles.input}
						type="password"
						autoComplete="new-password"
						required
						value={password}
						aria-describedby={describedBy}
						onChange={(event) => setPassword(event.target.value)}
					/>
				</div>
				<div className={styles.field}>
					<label htmlFor="register-confirm">{t("auth.register.confirm")}</label>
					<input
						id="register-confirm"
						className={styles.input}
						type="password"
						autoComplete="new-password"
						required
						value={confirm}
						aria-describedby={describedBy}
						onChange={(event) => setConfirm(event.target.value)}
					/>
				</div>
				{errorKey && (
					<p id={ERROR_ID} className={styles.error} role="alert">
						<span>{t(errorKey)}</span>
						{errorKey === "auth.errors.emailInUse" && (
							<>
								{" "}
								<Link to="/login">{t("nav.login")}</Link>
							</>
						)}
					</p>
				)}
				<Button type="submit" size="lg" disabled={submitting}>
					{t("auth.register.submit")}
				</Button>
			</form>
			<p className={styles.alternative}>
				{t("auth.register.haveAccount")}{" "}
				<Link to="/login">{t("nav.login")}</Link>
			</p>
		</section>
	);
}
