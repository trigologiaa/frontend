import { useTranslation } from "react-i18next";
import { team } from "../team";
import { TeamList } from "./TeamList";
import styles from "./TeamSection.module.css";

export function TeamSection() {
	const { t } = useTranslation();
	const people = team.map((member) => ({
		...member,
		role: t(member.roleKey),
		bio: t(member.bioKey),
	}));
	return (
		<section aria-labelledby="team-title" className={styles.section}>
			<h2 id="team-title" className={styles.title}>
				{t("footer.team.title")}
			</h2>
			<TeamList people={people} />
		</section>
	);
}
