import { useEffect, useRef } from "react";
import { Button } from "../../../shared/ui/Button";
import styles from "./ConfirmDialog.module.css";

export function ConfirmDialog({
	open,
	title,
	message,
	confirmLabel,
	cancelLabel,
	busy = false,
	onConfirm,
	onCancel,
}) {
	const dialog = useRef(null);

	useEffect(() => {
		const element = dialog.current;
		if (open && !element.open) element.showModal();
		if (!open && element.open) element.close();
	}, [open]);

	return (
		<dialog
			ref={dialog}
			className={styles.dialog}
			aria-labelledby="confirm-title"
			onClose={onCancel}
		>
			<h2 id="confirm-title" className={styles.title}>
				{title}
			</h2>
			<p>{message}</p>
			<div className={styles.actions}>
				<Button variant="danger" disabled={busy} onClick={onConfirm}>
					{confirmLabel}
				</Button>
				<Button variant="secondary" onClick={onCancel}>
					{cancelLabel}
				</Button>
			</div>
		</dialog>
	);
}
