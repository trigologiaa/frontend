export function TeamCard({
	name,
	role,
	bio,
	photo = "/images/avatar-placeholder.svg",
}) {
	return (
		<article>
			<img src={photo} alt={name} />
			<h3>{name}</h3>
			<p>{role}</p>
			<p>{bio}</p>
		</article>
	);
}
