import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaFloppyDisk } from "react-icons/fa6";
import { Button } from "../../../shared/ui/Button";
import { CATEGORIES, EMPTY_VALUES, validateService } from "../serviceForm";
import styles from "./FormularioServicio.module.css";

const FIELDS = [
	{ name: "titleEs", control: "input", type: "text" },
	{ name: "titleEn", control: "input", type: "text" },
	{ name: "descriptionEs", control: "textarea" },
	{ name: "descriptionEn", control: "textarea" },
	{ name: "price", control: "input", type: "number" },
	{ name: "category", control: "select" },
	{ name: "image", control: "input", type: "text" },
];

export function FormularioServicio({
	initialValues = EMPTY_VALUES,
	onSubmit,
	saving = false,
	errorKey = null,
	submitLabel,
	onCancel,
}) {
	const { t } = useTranslation();
	const [values, setValues] = useState(initialValues);
	const [errors, setErrors] = useState({});
	const [submitted, setSubmitted] = useState(false);
	const controls = useRef({});

	function handleChange(name, value) {
		const next = { ...values, [name]: value };
		setValues(next);
		if (submitted) setErrors(validateService(next));
	}

	function handleSubmit(event) {
		event.preventDefault();
		const found = validateService(values);
		setSubmitted(true);
		setErrors(found);
		const firstInvalid = FIELDS.find((field) => found[field.name]);
		if (firstInvalid) {
			controls.current[firstInvalid.name].focus();
			return;
		}
		onSubmit(values);
	}

	return (
		<form className={styles.form} onSubmit={handleSubmit} noValidate>
			{FIELDS.map(({ name, control, type }) => {
				const id = `service-${name}`;
				const errorId = `${id}-error`;
				const props = {
					id,
					ref: (element) => {
						controls.current[name] = element;
					},
					className: styles.control,
					value: values[name],
					onChange: (event) => handleChange(name, event.target.value),
					"aria-invalid": errors[name] ? "true" : undefined,
					"aria-describedby": errors[name] ? errorId : undefined,
				};
				return (
					<div className={styles.field} key={name}>
						<label htmlFor={id}>{t(`admin.form.${name}`)}</label>
						{control === "input" && <input type={type} {...props} />}
						{control === "textarea" && <textarea rows={3} {...props} />}
						{control === "select" && (
							<select {...props}>
								{CATEGORIES.map((category) => (
									<option key={category} value={category}>
										{t(`categories.${category}`)}
									</option>
								))}
							</select>
						)}
						{errors[name] && (
							<p id={errorId} className={styles.fieldError}>
								{t(errors[name])}
							</p>
						)}
					</div>
				);
			})}
			{errorKey && (
				<p className={styles.error} role="alert">
					{t(errorKey)}
				</p>
			)}
			<div className={styles.actions}>
				<Button type="submit" size="lg" icon={FaFloppyDisk} disabled={saving}>
					{submitLabel}
				</Button>
				{onCancel && (
					<Button variant="secondary" onClick={onCancel}>
						{t("admin.form.cancel")}
					</Button>
				)}
			</div>
		</form>
	);
}
