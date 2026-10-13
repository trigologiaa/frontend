import { TeamCard } from "./TeamCard";

export function TeamList({ people }) {
	return (
		<ul>
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
