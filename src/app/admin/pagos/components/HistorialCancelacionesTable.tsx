"use client";

export default function HistorialCancelacionesTable({
  historialCancelaciones,
}: {
  historialCancelaciones: any[];
}) {
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
        Historial de devoluciones
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
            <th style={{ padding: "10px" }}>
              Publicación
            </th>

            <th style={{ padding: "10px" }}>
              Canceló
            </th>

            <th style={{ padding: "10px" }}>
              Inquilino
            </th>

            <th style={{ padding: "10px" }}>
              Propietario
            </th>

            <th style={{ padding: "10px" }}>
              Fecha devolución
            </th>

            <th style={{ padding: "10px" }}>
              Monto
            </th>
          </tr>
        </thead>

        <tbody>
          {historialCancelaciones.map((c:any) => (
            <tr
              key={c.id}
              style={{
                borderBottom: "1px solid #333",
              }}
            >

              <td style={{ padding:"10px" }}>
                {c.publications?.titulo}
              </td>

              <td style={{ padding:"10px" }}>
                {c.cancelado_por}
              </td>

              <td style={{ padding:"10px" }}>
                {c.inquilino?.nombre}
              </td>

              <td style={{ padding:"10px" }}>
                {c.owner?.nombre}
              </td>

              <td style={{ padding: "10px" }}>
  {c.fecha_pago
    ? new Date(c.fecha_pago).toLocaleString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-"}
</td>

              <td
                style={{
                  padding:"10px",
                  fontWeight:"bold",
                }}
              >
                $
                {Number(
                  c.monto_devolver || 0
                ).toLocaleString("es-AR")}
              </td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}