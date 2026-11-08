import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaCheck } from "react-icons/fa6";
import { Link, Navigate } from "react-router-dom";
import { formatPrice } from "../../../shared/formatPrice";
import { Seo } from "../../../shared/Seo";
import { Button } from "../../../shared/ui/Button";
import { useLanguage } from "../../../shared/useLanguage";
import { createOrder } from "../../orders/ordersApi";
import { EMPTY_BUYER, validateBuyer } from "../checkoutValidation";
import { useCart } from "../context/useCart";
import styles from "./CheckoutPage.module.css";

const FIELDS = [
	{ name: "name", type: "text", autoComplete: "name" },
	{ name: "email", type: "email", autoComplete: "email" },
	{ name: "phone", type: "tel", autoComplete: "tel" },
];

export function CheckoutPage() {
	const { t } = useTranslation();
	const language = useLanguage();
	const { items, totalPrice, clearCart } = useCart();
	const [values, setValues] = useState(EMPTY_BUYER);
	const [errors, setErrors] = useState({});
	const [submitted, setSubmitted] = useState(false);
	const [saving, setSaving] = useState(false);
	const [failed, setFailed] = useState(false);
	const [orderId, setOrderId] = useState(null);
	const controls = useRef({});

	if (orderId) {
		return (
			<section className={styles.page}>
				<Seo
					title={t("seo.checkout.title")}
					description={t("seo.checkout.description")}
				/>
				<h1 className={styles.title}>{t("checkout.title")}</h1>
				<p className={styles.confirmation} role="status">
					{t("checkout.confirmed", { id: orderId })}
				</p>
				<Button as={Link} to="/" size="lg">
					{t("checkout.back")}
				</Button>
			</section>
		);
	}
	if (items.length === 0) return <Navigate to="/carrito" replace />;

	function handleChange(name, value) {
		const next = { ...values, [name]: value };
		setValues(next);
		if (submitted) setErrors(validateBuyer(next));
	}

	async function handleSubmit(event) {
		event.preventDefault();
		const found = validateBuyer(values);
		setSubmitted(true);
		setErrors(found);
		const firstInvalid = FIELDS.find((field) => found[field.name]);
		if (firstInvalid) {
			controls.current[firstInvalid.name].focus();
			return;
		}
		setSaving(true);
		setFailed(false);
		try {
			const id = await createOrder({
				buyer: {
					name: values.name.trim(),
					email: values.email.trim(),
					phone: values.phone.trim(),
				},
				items: items.map(({ id, title, price, quantity }) => ({
					id,
					title,
					price,
					quantity,
				})),
				total: totalPrice,
			});
			clearCart();
			setOrderId(id);
		} catch {
			setFailed(true);
		} finally {
			setSaving(false);
		}
	}

	return (
		<section className={styles.page}>
			<Seo
				title={t("seo.checkout.title")}
				description={t("seo.checkout.description")}
			/>
			<h1 className={styles.title}>{t("checkout.title")}</h1>
			<p className={styles.total}>
				{t("cart.total")}: {formatPrice(totalPrice, language)}
			</p>
			<form className={styles.form} onSubmit={handleSubmit} noValidate>
				{FIELDS.map(({ name, type, autoComplete }) => {
					const id = `buyer-${name}`;
					const errorId = `${id}-error`;
					return (
						<div className={styles.field} key={name}>
							<label htmlFor={id}>{t(`checkout.${name}`)}</label>
							<input
								id={id}
								ref={(element) => {
									controls.current[name] = element;
								}}
								className={styles.input}
								type={type}
								autoComplete={autoComplete}
								value={values[name]}
								onChange={(event) => handleChange(name, event.target.value)}
								aria-invalid={errors[name] ? "true" : undefined}
								aria-describedby={errors[name] ? errorId : undefined}
							/>
							{errors[name] && (
								<p id={errorId} className={styles.fieldError}>
									{t(errors[name])}
								</p>
							)}
						</div>
					);
				})}
				{failed && (
					<p className={styles.error} role="alert">
						{t("checkout.errors.save")}
					</p>
				)}
				<Button type="submit" size="lg" icon={FaCheck} disabled={saving}>
					{t("checkout.submit")}
				</Button>
			</form>
		</section>
	);
}
