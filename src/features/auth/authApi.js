import {
	createUserWithEmailAndPassword,
	signOut as firebaseSignOut,
	onAuthStateChanged,
	signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebase/config";

function requireAuth() {
	if (!auth) return Promise.reject({ code: "auth/configuration-not-found" });
	return Promise.resolve(auth);
}

function toUser(firebaseUser) {
	return firebaseUser
		? { uid: firebaseUser.uid, email: firebaseUser.email }
		: null;
}

export const authApi = {
	async signUp(email, password) {
		const instance = await requireAuth();
		const { user } = await createUserWithEmailAndPassword(
			instance,
			email,
			password,
		);
		return toUser(user);
	},
	async signIn(email, password) {
		const instance = await requireAuth();
		const { user } = await signInWithEmailAndPassword(
			instance,
			email,
			password,
		);
		return toUser(user);
	},
	async signOut() {
		const instance = await requireAuth();
		await firebaseSignOut(instance);
	},
	onAuthChange(callback) {
		if (!auth) {
			callback(null);
			return () => {};
		}
		return onAuthStateChanged(auth, (user) => callback(toUser(user)));
	},
	async getRole(uid) {
		try {
			const snapshot = await getDoc(doc(db, "usuarios", uid));
			return snapshot.exists() && snapshot.data().rol === "admin"
				? "admin"
				: "user";
		} catch {
			return "user";
		}
	},
};
