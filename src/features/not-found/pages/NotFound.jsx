import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <>
      <h1>404 - No encontramos esa página</h1>
      <p>Puede que el link esté mal escrito, o que la página ya no exista.</p>
      <Link to="/">Volver al inicio</Link>
    </>
  );
}
