import { Item } from "./Item";
import styles from "./ItemList.module.css";

export function ItemList({ services }) {
	return (
		<ul className={styles.list}>
			{services.map((service) => (
				<li key={service.id}>
					<Item service={service} />
				</li>
			))}
		</ul>
	);
}
