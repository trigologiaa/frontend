import { Col, Row } from "react-bootstrap";
import { TeamCard } from "./TeamCard";
import styles from "./TeamList.module.css";

export function TeamList({ people }) {
	return (
		<Row as="ul" className={`g-4 ${styles.list}`}>
			{people.map((person) => (
				<Col as="li" key={person.id} xs={12} md={4}>
					<TeamCard
						name={person.name}
						role={person.role}
						bio={person.bio}
						photo={person.photo}
					/>
				</Col>
			))}
		</Row>
	);
}
