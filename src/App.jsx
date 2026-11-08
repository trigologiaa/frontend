import "bootstrap/dist/css/bootstrap-grid.min.css";
import "./styles/tokens.css";
import "./styles/global.css";
import { lazy } from "react";
import { Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./features/auth/ProtectedRoute";
import { CartPage } from "./features/cart/pages/CartPage";
import { Home } from "./features/home/pages/Home";
import { NotFound } from "./features/not-found/pages/NotFound";
import { ItemDetailContainer } from "./features/services/pages/ItemDetailContainer";
import { ItemListContainer } from "./features/services/pages/ItemListContainer";
import { useDocumentLanguage } from "./i18n/useDocumentLanguage";
import { Layout } from "./layout/Layout";

const LoginPage = lazy(() =>
	import("./features/auth/pages/LoginPage").then((m) => ({
		default: m.LoginPage,
	})),
);
const RegisterPage = lazy(() =>
	import("./features/auth/pages/RegisterPage").then((m) => ({
		default: m.RegisterPage,
	})),
);
const ProfilePage = lazy(() =>
	import("./features/auth/pages/ProfilePage").then((m) => ({
		default: m.ProfilePage,
	})),
);
const Gestion = lazy(() =>
	import("./features/admin/pages/Gestion").then((m) => ({
		default: m.Gestion,
	})),
);
const CheckoutPage = lazy(() =>
	import("./features/cart/pages/CheckoutPage").then((m) => ({
		default: m.CheckoutPage,
	})),
);

export function App() {
	useDocumentLanguage();
	return (
		<Routes>
			<Route element={<Layout />}>
				<Route path="*" element={<NotFound />} />
				<Route index element={<Home />} />
				<Route path="/servicios" element={<ItemListContainer />} />
				<Route path="/servicio/:id" element={<ItemDetailContainer />} />
				<Route path="/carrito" element={<CartPage />} />
				<Route path="/checkout" element={<CheckoutPage />} />
				<Route path="/login" element={<LoginPage />} />
				<Route path="/registro" element={<RegisterPage />} />
				<Route element={<ProtectedRoute />}>
					<Route path="/perfil" element={<ProfilePage />} />
				</Route>
				<Route element={<ProtectedRoute roles={["admin"]} />}>
					<Route path="/admin" element={<Gestion />} />
				</Route>
			</Route>
		</Routes>
	);
}
