import { TeamCard } from "./TeamCard";
import styles from "./TeamList.module.css";

export function TeamList({ people }) {
	return (
		<ul className={styles.list}>
			{people.map((person) => (
				<li key={person.id}>
					<TeamCard
						name={person.name}
						role={person.role}
						bio={person.bio}
						photo={person.photo}
					/>
				</li>
			))}
		</ul>
	);
}
