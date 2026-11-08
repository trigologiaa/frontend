import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;

// Without an API key the site keeps working as an anonymous visitor and the
// exports are null: `authApi` and `servicesApi` decide what to do about it.
const app = apiKey
	? initializeApp({
			apiKey,
			authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
			projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
			appId: import.meta.env.VITE_FIREBASE_APP_ID,
		})
	: null;
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
