import { Outlet } from "react-router-dom";
import { Footer } from "./Footer";
import { Header } from "./Header";
import styles from "./Layout.module.css";
import { NavBar } from "./NavBar";

export function Layout() {
	return (
		<div className={styles.layout}>
			<Header />
			<NavBar />
			<main className={styles.main}>
				<Outlet />
			</main>
			<Footer />
		</div>
	);
}
