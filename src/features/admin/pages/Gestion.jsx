import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FaPenToSquare, FaTrash } from "react-icons/fa6";
import { formatPrice } from "../../../shared/formatPrice";
import { localized } from "../../../shared/localized";
import { notify } from "../../../shared/notify";
import { Seo } from "../../../shared/Seo";
import { Spinner } from "../../../shared/Spinner";
import { Button } from "../../../shared/ui/Button";
import { useLanguage } from "../../../shared/useLanguage";
import { useServices } from "../../services/hooks/useServices";
import {
	createService,
	deleteService,
	updateService,
} from "../../services/services/servicesApi";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { FormularioServicio } from "../components/FormularioServicio";
import { toFormValues, toServiceData } from "../serviceForm";
import styles from "./Gestion.module.css";

export function Gestion() {
	const { t } = useTranslation();
	const language = useLanguage();
	const [reloadKey, setReloadKey] = useState(0);
	const { services, loading, error } = useServices(reloadKey);
	const [editing, setEditing] = useState(null);
	const [deleting, setDeleting] = useState(null);
	const [saving, setSaving] = useState(false);
	const [errorKey, setErrorKey] = useState(null);
	const [formKey, setFormKey] = useState(0);

	function finish(notice) {
		notify.success(notice);
		setFormKey((key) => key + 1);
		setReloadKey((key) => key + 1);
	}

	async function handleSubmit(values) {
		setSaving(true);
		setErrorKey(null);
		try {
			const data = toServiceData(values);
			if (editing) {
				await updateService(editing.id, data);
				setEditing(null);
				finish("toast.saved");
			} else {
				await createService(data);
				finish("toast.saved");
			}
		} catch {
			setErrorKey("admin.errors.save");
			notify.error("toast.error");
		} finally {
			setSaving(false);
		}
	}

	async function handleConfirmDelete() {
		const target = deleting;
		setDeleting(null);
		setErrorKey(null);
		try {
			await deleteService(target.id);
			if (editing?.id === target.id) setEditing(null);
			finish("toast.deleted");
		} catch {
			setErrorKey("admin.errors.delete");
			notify.error("toast.error");
		}
	}

	let list;
	if (loading) {
		list = <Spinner />;
	} else if (error) {
		list = <p role="alert">{t("catalog.error")}</p>;
	} else {
		list = (
			<ul className={styles.list}>
				{services.map((service) => {
					const title = localized(service.title, language);
					return (
						<li className={styles.row} key={service.id}>
							<span className={styles.name}>{title}</span>
							<span>{formatPrice(service.price, language)}</span>
							<Button
								variant="secondary"
								icon={FaPenToSquare}
								aria-label={`${t("admin.list.edit")} ${title}`}
								onClick={() => setEditing(service)}
							>
								{t("admin.list.edit")}
							</Button>
							<Button
								variant="danger"
								icon={FaTrash}
								aria-label={`${t("admin.list.delete")} ${title}`}
								onClick={() => setDeleting(service)}
							>
								{t("admin.list.delete")}
							</Button>
						</li>
					);
				})}
			</ul>
		);
	}

	return (
		<section className={styles.page}>
			<Seo
				title={t("seo.admin.title")}
				description={t("seo.admin.description")}
			/>
			<h1 className={styles.title}>{t("admin.title")}</h1>
			<h2 className={styles.subtitle}>
				{editing ? t("admin.form.editTitle") : t("admin.form.createTitle")}
			</h2>
			<FormularioServicio
				key={editing ? editing.id : `new-${formKey}`}
				initialValues={editing ? toFormValues(editing) : undefined}
				onSubmit={handleSubmit}
				saving={saving}
				errorKey={errorKey}
				submitLabel={editing ? t("admin.form.save") : t("admin.form.create")}
				onCancel={editing ? () => setEditing(null) : undefined}
			/>
			<h2 className={styles.subtitle}>{t("admin.list.title")}</h2>
			{list}
			<ConfirmDialog
				open={Boolean(deleting)}
				title={t("admin.delete.title")}
				message={t("admin.delete.message", {
					title: deleting ? localized(deleting.title, language) : "",
				})}
				confirmLabel={t("admin.delete.confirm")}
				cancelLabel={t("admin.delete.cancel")}
				onConfirm={handleConfirmDelete}
				onCancel={() => setDeleting(null)}
			/>
		</section>
	);
}
