import { Item } from "./Item";

export function ItemList({ services }) {
	return (
		<ul>
			{services.map((service) => (
				<li key={service.id}>
					<Item service={service} />
				</li>
			))}
		</ul>
	);
}
