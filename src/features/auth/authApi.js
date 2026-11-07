import { initializeApp } from "firebase/app";
import {
	createUserWithEmailAndPassword,
	signOut as firebaseSignOut,
	getAuth,
	onAuthStateChanged,
	signInWithEmailAndPassword,
} from "firebase/auth";

let auth;

// Without a configured API key the site keeps working as anonymous: reading never throws.
function getFirebaseAuth() {
	const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
	if (!apiKey) return null;
	auth ??= getAuth(
		initializeApp({
			apiKey,
			authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
			projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
			appId: import.meta.env.VITE_FIREBASE_APP_ID,
		}),
	);
	return auth;
}

function requireAuth() {
	const instance = getFirebaseAuth();
	if (!instance) {
		return Promise.reject({ code: "auth/configuration-not-found" });
	}
	return Promise.resolve(instance);
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
		const instance = getFirebaseAuth();
		if (!instance) {
			callback(null);
			return () => {};
		}
		return onAuthStateChanged(instance, (user) => callback(toUser(user)));
	},
};
