import styles from "./TeamCard.module.css";

export function TeamCard({
	name,
	role,
	bio,
	photo = "/images/avatar-placeholder.svg",
}) {
	return (
		<article className={styles.card}>
			<img src={photo} alt={name} className={styles.img} />
			<h3 className={styles.name}>{name}</h3>
			<p className={styles.role}>{role}</p>
			<p className={styles.bio}>{bio}</p>
		</article>
	);
}
