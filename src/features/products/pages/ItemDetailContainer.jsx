import { useParams } from "react-router-dom";

export function ItemDetailContainer() {
  const { id } = useParams();
  return (
    <>
      <h1>Detalle del servicio</h1>
      <p>{id}</p>
    </>
  );
}
