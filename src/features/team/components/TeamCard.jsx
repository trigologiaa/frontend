export function TeamCard({ name, role, bio }) {
	return (
		<article>
			<h3>{name}</h3>
			<p>{role}</p>
			<p>{bio}</p>
		</article>
	);
}
