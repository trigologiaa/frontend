import { Route, Routes } from "react-router-dom";
import { Home } from "./features/home/pages/Home";
import { Layout } from "./layout/Layout";

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
      </Route>
    </Routes>
  );
}
