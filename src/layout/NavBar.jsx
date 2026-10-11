import { NavLink } from "react-router-dom";

export function NavBar() {
  return (
    <nav aria-label="Navegación principal">
      <NavLink to="/">Inicio</NavLink>
      <NavLink to="/servicios">Servicios</NavLink>
      <NavLink to="/carrito">Carrito</NavLink>
    </nav>
  );
}
