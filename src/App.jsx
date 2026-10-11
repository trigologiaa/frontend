import { Route, Routes } from "react-router-dom";
import { Home } from "./features/home/pages/Home";
import { Layout } from "./layout/Layout";
import { ItemListContainer } from "./features/products/pages/ItemListContainer";
import { ItemDetailContainer } from "./features/products/pages/ItemDetailContainer";
import { CartPage } from "./features/cart/pages/CartPage";

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="/servicios" element={<ItemListContainer />} />
        <Route path="/servicio/:id" element={<ItemDetailContainer />} />
        <Route path="/carrito" element={<CartPage />} />
      </Route>
    </Routes>
  );
}
