import { Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AppToaster } from "../shared/AppToaster";
import { ErrorBoundary } from "../shared/ErrorBoundary";
import { Spinner } from "../shared/Spinner";
import { Footer } from "./Footer";
import { Header } from "./Header";
import styles from "./Layout.module.css";
import { NavBar } from "./NavBar";

export function Layout() {
	const { pathname } = useLocation();
	return (
		<div className={styles.layout}>
			<Header />
			<NavBar />
			<main className={styles.main}>
				<ErrorBoundary key={pathname}>
					<Suspense fallback={<Spinner />}>
						<Outlet />
					</Suspense>
				</ErrorBoundary>
			</main>
			<Footer />
			<AppToaster />
		</div>
	);
}
