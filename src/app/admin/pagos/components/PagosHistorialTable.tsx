"use client";

export default function PagosHistorialTable({
  operaciones,
}: {
  operaciones: any[];
}) {
  return (
    <div
      style={{
        background: "#111",
        borderRadius: "12px",
        overflow: "hidden",
        marginTop: "30px",
      }}
    >
      <h3
        style={{
          color: "#FFFFFF",
          padding: "20px",
          margin: 0,
        }}
      >
        🟢 Historial de pagos realizados
      </h3>

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
            <th style={{ padding: "15px" }}>Transferido</th>
            <th style={{ padding: "15px" }}>Fecha pago</th>
            <th style={{ padding: "15px" }}>Local</th>
            <th style={{ padding: "15px" }}>Destinatario</th>
            <th style={{ padding: "15px" }}>Teléfono</th>
            <th style={{ padding: "15px" }}>Importe</th>
            <th style={{ padding: "15px" }}>Destino</th>
            
          </tr>
        </thead>

        <tbody>
          {operaciones.length === 0 ? (
            <tr>
              <td
                colSpan={7}
                style={{
                  padding: "30px",
                  textAlign: "center",
                  color: "#999",
                }}
              >
                No hay pagos realizados.
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
  {operacion.fecha_pago_real
    ? new Date(operacion.fecha_pago_real).toLocaleString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-"}
</td>

<td style={{ padding: "15px" }}>
  {operacion.fecha}
</td>

                <td style={{ padding: "15px" }}>
                  {operacion.publications?.titulo}
                </td>

                <td style={{ padding: "15px" }}>
                  {operacion.publications?.profiles?.nombre}
                </td>

                <td style={{ padding: "15px" }}>
                  {operacion.publications?.profiles?.telefono}
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

                
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}