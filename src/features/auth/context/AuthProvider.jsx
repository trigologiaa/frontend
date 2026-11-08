import { useEffect, useMemo, useState } from "react";
import { authApi } from "../authApi";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children, api = authApi }) {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(
		() =>
			api.onAuthChange(async (firebaseUser) => {
				if (!firebaseUser) {
					setUser(null);
					setLoading(false);
					return;
				}
				const role = await api.getRole(firebaseUser.uid);
				setUser({ ...firebaseUser, role });
				setLoading(false);
			}),
		[api],
	);

	const value = useMemo(
		() => ({
			user,
			loading,
			signIn: api.signIn,
			signUp: api.signUp,
			signOut: api.signOut,
		}),
		[user, loading, api],
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
