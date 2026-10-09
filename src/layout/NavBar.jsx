import { Link } from "react-router-dom";

export function NavBar() {
  return (
    <nav aria-label="Navegación principal">
      <Link to="/">Inicio</Link>
      <Link to="/productos">Servicios</Link>
      <Link to="/carrito">Carrito</Link>
    </nav>
  );
}
