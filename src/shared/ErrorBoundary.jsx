import { Component } from "react";
import { withTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import styles from "./ErrorBoundary.module.css";
import { Button } from "./ui/Button";

class Boundary extends Component {
	state = { failed: false };

	static getDerivedStateFromError() {
		return { failed: true };
	}

	render() {
		const { t, children } = this.props;
		if (!this.state.failed) return children;
		return (
			<section className={styles.box} role="alert">
				<p>{t("common.chunkError")}</p>
				<Button onClick={() => window.location.reload()}>
					{t("common.reload")}
				</Button>
				<Button
					as={Link}
					variant="secondary"
					to="/"
					onClick={() => this.setState({ failed: false })}
				>
					{t("common.home")}
				</Button>
			</section>
		);
	}
}

export const ErrorBoundary = withTranslation()(Boundary);
