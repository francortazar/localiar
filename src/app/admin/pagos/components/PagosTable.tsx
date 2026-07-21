"use client";

import { supabase } from "../../../lib/supabase";


async function marcarComoPagado(id: string) {
  const confirmar = window.confirm(
    "¿Confirmás que ya realizaste esta transferencia?"
  );

  if (!confirmar) return;

  console.log("ID que intento actualizar:", id);

  const response = await fetch("/api/admin/pagos/marcar-pagado", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    id,
  }),
});

const resultado = await response.json();

console.log(resultado);

alert(resultado.mensaje);
}

export default function PagosTable({
  operaciones,
}: {
  operaciones: any[];
}) {

  async function guardarDestino(id: string, destino: string) {
  const { error } = await supabase
    .from("reservations")
    .update({ destino })
    .eq("id", id);

  if (error) {
    console.error(error);
    alert("No se pudo guardar el destino.");
  }
}
  return (
    <div
      style={{
        background: "#111",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          color: "#FFFFFF",
        }}
      >
        <thead>
          <tr
            style={{
              borderBottom: "1px solid #333",
              textAlign: "left",
            }}
          >
            <th style={{ padding: "15px" }}>Fecha de pago</th>
<th style={{ padding: "15px" }}>Local</th>
<th style={{ padding: "15px" }}>Destinatario</th>
<th style={{ padding: "15px" }}>Teléfono</th>
<th style={{ padding: "15px" }}>Email</th>
<th style={{ padding: "15px" }}>Días</th>
<th style={{ padding: "15px" }}>Rol</th>
<th style={{ padding: "15px" }}>Importe</th>
<th style={{ padding: "15px" }}>Destino</th>
<th style={{ padding: "15px" }}>Estado</th>
          </tr>
        </thead>

       <tbody>
  {operaciones.length === 0 ? (
    <tr>
      <td
        colSpan={9}
        style={{
          padding: "30px",
          textAlign: "center",
          color: "#999",
        }}
      >
        No hay operaciones para mostrar.
      </td>
    </tr>
  ) : (
    operaciones.map((operacion) => (
      <tr
  key={operacion.id}
  style={{
    borderBottom: "1px solid #333",
  }}
>
 <td style={{ padding: "15px" }}>
  {operacion.fechaPago}
</td>

  <td style={{ padding: "15px" }}>
    {operacion.publications?.titulo}
  </td>

  <td style={{ padding: "15px" }}>
    {operacion.publications?.profiles?.nombre}
  </td>

  <td style={{ padding: "15px" }}>
  {operacion.publications?.profiles?.telefono || "-"}
</td>

<td style={{ padding: "15px" }}>
  {operacion.publications?.profiles?.email}
</td>

<td style={{ padding: "15px" }}>
  {operacion.cantidadDias} día{operacion.cantidadDias > 1 ? "s" : ""}
</td>

<td style={{ padding: "15px" }}>
  Propietario
</td>

  <td style={{ padding: "15px" }}>
  $
  {(
    operacion.publications?.precio_dia *
    operacion.cantidadDias *
    0.925
  ).toLocaleString("es-AR")}
</td>

  <td style={{ padding: "15px" }}>
  {operacion.publications?.alias_pago || "-"}
</td>

  <td style={{ padding: "15px" }}>
  <button
    onClick={() => marcarComoPagado(operacion.operacion_id)}
    style={{
      background: "#dc2626",
      color: "#fff",
      border: "none",
      padding: "8px 14px",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: 600,
    }}
  >
    Pagar
  </button>
</td>
</tr>
    ))
  )}
</tbody>
      </table>
    </div>
  );
}