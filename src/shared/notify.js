import { toast } from "react-toastify";
import { i18n } from "../i18n";

export const notify = {
	success: (key) => toast.success(i18n.t(key)),
	error: (key) => toast.error(i18n.t(key)),
};
