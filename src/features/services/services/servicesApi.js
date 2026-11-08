import {
	addDoc,
	collection,
	deleteDoc,
	doc,
	getDoc,
	getDocs,
	updateDoc,
} from "firebase/firestore";
import { db } from "../../../firebase/config";

function toService(snapshot) {
	return { id: snapshot.id, ...snapshot.data() };
}

export async function getServices({ signal } = {}) {
	const snapshot = await getDocs(collection(db, "services"));
	signal?.throwIfAborted();
	return snapshot.docs.map(toService);
}

export async function getServiceById(id, { signal } = {}) {
	const snapshot = await getDoc(doc(db, "services", id));
	signal?.throwIfAborted();
	return snapshot.exists() ? toService(snapshot) : null;
}

export async function createService(data) {
	const reference = await addDoc(collection(db, "services"), data);
	return { id: reference.id, ...data };
}

export async function updateService(id, data) {
	await updateDoc(doc(db, "services", id), data);
	return { id, ...data };
}

export async function deleteService(id) {
	await deleteDoc(doc(db, "services", id));
}
