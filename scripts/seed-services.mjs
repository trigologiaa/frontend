// One-off: loads public/servicios.json into the Firestore "services" collection.
// Usage: node --env-file=.env.local scripts/seed-services.mjs
import { readFile } from "node:fs/promises";
import { initializeApp } from "firebase/app";
import { doc, getFirestore, setDoc } from "firebase/firestore";

const app = initializeApp({
	apiKey: process.env.VITE_FIREBASE_API_KEY,
	authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
	projectId: process.env.VITE_FIREBASE_PROJECT_ID,
	appId: process.env.VITE_FIREBASE_APP_ID,
});
const db = getFirestore(app);

const services = JSON.parse(await readFile("public/servicios.json", "utf8"));
for (const { id, ...data } of services) {
	await setDoc(doc(db, "services", id), data);
	console.log(`seeded ${id}`);
}
process.exit(0);
