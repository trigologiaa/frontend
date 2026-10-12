import { Route, Routes } from "react-router-dom";
import { CartPage } from "./features/cart/pages/CartPage";
import { Home } from "./features/home/pages/Home";
import { NotFound } from "./features/not-found/pages/NotFound";
import { ItemDetailContainer } from "./features/services/pages/ItemDetailContainer";
import { ItemListContainer } from "./features/services/pages/ItemListContainer";
import { Layout } from "./layout/Layout";

export function App() {
	return (
		<Routes>
			<Route element={<Layout />}>
				<Route path="*" element={<NotFound />} />
				<Route index element={<Home />} />
				<Route path="/servicios" element={<ItemListContainer />} />
				<Route path="/servicio/:id" element={<ItemDetailContainer />} />
				<Route path="/carrito" element={<CartPage />} />
			</Route>
		</Routes>
	);
}
