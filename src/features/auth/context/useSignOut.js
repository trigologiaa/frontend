import { useNavigate } from "react-router-dom";
import { notify } from "../../../shared/notify";
import { useAuth } from "./useAuth";

export function useSignOut() {
	const { signOut } = useAuth();
	const navigate = useNavigate();
	return async function handleSignOut() {
		await signOut();
		notify.success("toast.signedOut");
		navigate("/");
	};
}
