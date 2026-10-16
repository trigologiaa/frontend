import styles from "./TeamCard.module.css";

export function TeamCard({ name, role, bio, photo }) {
	return (
		<article className={styles.card}>
			{photo && (
				<img
					src={photo}
					alt={name}
					className={styles.photo}
					width="96"
					height="96"
					loading="lazy"
				/>
			)}
			<h3 className={styles.name}>{name}</h3>
			<p className={styles.role}>{role}</p>
			<p className={styles.bio}>{bio}</p>
		</article>
	);
}
