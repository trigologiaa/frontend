import { NavItem } from "./NavItem";

export function NavBar() {
  return (
    <nav aria-label="Navegación principal">
      <NavItem to="/">Inicio</NavItem>
      <NavItem to="/servicios" activeFor={["/servicio/:id"]}>Servicios</NavItem>
      <NavItem to="/carrito">Carrito</NavItem>
    </nav>
  );
}
