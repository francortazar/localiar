"use client";

import { supabase } from "@/app/lib/supabase";

export default function CancelacionesTable({
  cancelaciones,
  onPagoRealizado,
}: {
  cancelaciones: any[];
  onPagoRealizado: (id: string) => void;
}) {

 async function marcarComoPagado(id: string) {
  const { error } = await supabase
    .from("reservation_cancellations")
    .update({
      estado_pago: "pagado",
      fecha_pago: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    alert(error.message);
    return;
  }

  onPagoRealizado(id);
}

  return (
  <div
    style={{
      marginTop: "40px",
      background: "#111",
      borderRadius: "12px",
      padding: "20px",
    }}
  >
    <h2
      style={{
        color: "#FFF",
        marginBottom: "20px",
      }}
    >
      Cancelaciones de reservas
    </h2>

    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        color: "white",
      }}
    >
      <thead>
        <tr>
          <th style={{ textAlign: "left", padding: "10px" }}>
  Publicación
</th>

<th style={{ textAlign: "left", padding: "10px" }}>
  Canceló
</th>

<th style={{ textAlign: "left", padding: "10px" }}>
  Inquilino
</th>

<th style={{ textAlign: "left", padding: "10px" }}>
  Propietario
</th>

<th style={{ textAlign: "left", padding: "10px" }}>
  Motivo
</th>

<th style={{ textAlign: "right", padding: "10px" }}>
  Devolución alquiler
</th>

<th style={{ textAlign: "right", padding: "10px" }}>
  Devolución resguardo
</th>

<th style={{ textAlign: "right", padding: "10px" }}>
  Monto a devolver
</th>
<th
  style={{
    textAlign: "center",
    padding: "10px",
  }}
>
  Acción
</th>
        </tr>
      </thead>

      <tbody>
        {cancelaciones.map((c: any) => (
          <tr
  key={c.id}
  style={{
    borderBottom: "1px solid #333",
  }}
>
            <td
  style={{
    padding: "10px",
    borderRight: "1px solid #333",
  }}
>
              {c.publications?.titulo}
            </td>

            <td
  style={{
    padding: "10px",
    borderRight: "1px solid #333",
  }}
>
              {c.cancelado_por}
            </td>

            <td
  style={{
    padding: "10px",
    borderRight: "1px solid #333",
  }}
>
              {c.inquilino?.nombre}
            </td>

            <td
  style={{
    padding: "10px",
    borderRight: "1px solid #333",
  }}
>
              {c.owner?.nombre}
            </td>

           <td
  style={{
    padding: "10px",
    borderRight: "1px solid #333",
    fontWeight: "bold",
  }}
>
  {(() => {
    if (c.cancelado_por === "inquilino") {
      return (
        <span style={{ color: "#ff5b5b" }}>
          🔴 Cancelación del inquilino
        </span>
      );
    }

    if (Number(c.resguardo || 0) > 0) {
      return (
        <span style={{ color: "#8b5cf6" }}>
          🟣 Cancelación total del propietario
        </span>
      );
    }

    return (
      <span style={{ color: "#f59e0b" }}>
        🟠 Cancelación parcial del propietario
      </span>
    );
  })()}
</td>

            <td
  style={{
    padding: "10px",
    textAlign: "right",
  }}
>
  {(() => {
    const precioDia =
      Number(c.publications?.precio_dia || 0);

    const dias =
      c.fechas?.length || c.cantidad_dias || 1;

    const alquiler =
      c.cancelado_por === "inquilino"
        ? precioDia * dias
        : precioDia * dias * 1.075;

    return `$${alquiler.toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  })()}
</td>

<td
  style={{
    padding: "10px",
    textAlign: "right",
  }}
>
  {`$${Number(c.resguardo || 0).toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`}
</td>

<td
  style={{
    padding: "10px",
    textAlign: "right",
    fontWeight: "bold",
  }}
>
  {(() => {
    const precioDia =
      Number(c.publications?.precio_dia || 0);

    const dias =
      c.fechas?.length || c.cantidad_dias || 1;

    const devolucionAlquiler =
      c.cancelado_por === "inquilino"
        ? precioDia * dias
        : precioDia * dias * 1.075;

    const devolucionResguardo =
      Number(c.resguardo || 0);

    const total =
      devolucionAlquiler + devolucionResguardo;

    return `$${total.toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  })()}
</td>

<td
  style={{
    padding: "10px",
    textAlign: "center",
  }}
>
  <button
  onClick={() => marcarComoPagado(c.id)}
  style={{
    padding: "6px 12px",
    borderRadius: "6px",
    border: "none",
    background: "#16a34a",
    color: "white",
    cursor: "pointer",
    fontWeight: "bold",
  }}
>
  ✔ Marcar pagado
</button>
</td>

          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
}