"use client";

import { useState } from "react";
import ImageViewer from "./ImageViewer";

export default function ReclamosHistorialTable({
  reclamos,
}: {
  reclamos: any[];
}) {

    console.log("Reclamos recibidos en historial:", reclamos);
const [imagenesAbiertas, setImagenesAbiertas] = useState<string[] | null>(null);

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
        📋 Historial de reclamos
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
            <th style={{ padding: "15px" }}>Fecha</th>
            <th style={{ padding: "15px" }}>Estado</th>
            <th style={{ padding: "15px" }}>Publicación</th>
            <th style={{ padding: "15px" }}>Propietario</th>
            <th style={{ padding: "15px" }}>Inquilino</th>
            <th style={{ padding: "15px" }}>Monto</th>
            <th style={{ padding: "15px" }}>Descripción</th>
            <th style={{ padding: "15px" }}>Fotos</th>
          </tr>
        </thead>

        <tbody>
          {reclamos.length === 0 ? (
            <tr>
              <td
                colSpan={8}
                style={{
                  padding: "30px",
                  textAlign: "center",
                  color: "#999",
                }}
              >
                No hay reclamos resueltos.
              </td>
            </tr>
          ) : (
            reclamos.map((reclamo) => (
              <tr
                key={reclamo.id}
                style={{
                  borderBottom: "1px solid #333",
                }}
              >
               <td style={{ padding: "15px", whiteSpace: "nowrap" }}>
  {new Date(reclamo.created_at).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })}
</td>

                <td style={{ padding: "15px" }}>
  <span
    style={{
      display: "inline-block",
      padding: "6px 10px",
      borderRadius: "8px",
      fontWeight: "bold",
      fontSize: "13px",
      background:
        reclamo.status === "approved"
          ? "rgba(34, 197, 94, 0.15)"
          : "rgba(239, 68, 68, 0.15)",
      color:
        reclamo.status === "approved"
          ? "#22C55E"
          : "#EF4444",
    }}
  >
    {reclamo.status === "approved" ? "Aprobado" : "Rechazado"}
  </span>
</td>

                <td style={{ padding: "15px" }}>
  {reclamo.reservas?.[0]?.publications?.titulo || "-"}
</td>

                <td style={{ padding: "15px" }}>
  {reclamo.reservas?.[0]?.publications?.profiles?.nombre || "-"}
</td>

                <td style={{ padding: "15px" }}>
  {reclamo.reservas?.[0]?.profiles?.nombre || "-"}
</td>

                <td style={{ padding: "15px" }}>
  ${reclamo.reservas?.[0]?.publications?.resguardo ?? "-"}
</td>

                <td style={{ padding: "15px" }}>
                  {reclamo.description}
                </td>

                <td style={{ padding: "15px" }}>
  {reclamo.owner_claim_images?.length > 0 ? (
    <button
      onClick={() =>
        setImagenesAbiertas(
          reclamo.owner_claim_images.map(
            (imagen: any) => imagen.image_url
          )
        )
      }
      style={{
        background: "none",
        border: "none",
        color: "#4DA3FF",
        cursor: "pointer",
        padding: 0,
        textDecoration: "underline",
      }}
    >
      Ver fotos ({reclamo.owner_claim_images.length})
    </button>
  ) : (
    "-"
  )}
</td>
              </tr>
            ))
          )}
        </tbody>
            </table>

      {imagenesAbiertas && (
        <ImageViewer
          images={imagenesAbiertas}
          onClose={() => setImagenesAbiertas(null)}
        />
      )}
    </div>
  );
}