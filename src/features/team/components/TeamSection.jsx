import { useTranslation } from "react-i18next";
import { team } from "../team";
import { TeamList } from "./TeamList";

export function TeamSection() {
	const { t } = useTranslation();
	const people = team.map((member) => ({
		...member,
		role: t(member.roleKey),
		bio: t(member.bioKey),
	}));
	return (
		<section aria-labelledby="team-title">
			<h2 id="team-title">{t("footer.team.title")}</h2>
			<TeamList people={people} />
		</section>
	);
}
