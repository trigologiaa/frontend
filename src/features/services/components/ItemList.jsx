import { Col, Row } from "react-bootstrap";
import { Item } from "./Item";
import styles from "./ItemList.module.css";

export function ItemList({ services }) {
	return (
		<Row as="ul" className={`g-4 ${styles.list}`}>
			{services.map((service) => (
				<Col as="li" key={service.id} xs={12} md={6} lg={4}>
					<Item service={service} />
				</Col>
			))}
		</Row>
	);
}
