import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/config";

export async function createOrder(order) {
	const reference = await addDoc(collection(db, "orders"), {
		...order,
		createdAt: serverTimestamp(),
	});
	return reference.id;
}
