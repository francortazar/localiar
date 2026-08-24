"use client";

import { useState } from "react";
import ImageViewer from "./ImageViewer";
import ReclamoConfirmModal from "./ReclamoConfirmModal";
import { supabase } from "../../../lib/supabase";
import { enviarEmailResguardo } from "@/app/lib/enviarEmailResguardo";
import { enviarEmailsRechazoResguardo } from "@/app/lib/enviarEmailsRechazoResguardo";

export default function ReclamosTable({
  reclamos,
  onReclamoActualizado,
}: {
  reclamos: any[];
  onReclamoActualizado: (id: string, status: string) => void;
}) {

    const [imagenesAbiertas, setImagenesAbiertas] = useState<string[] | null>(null);
    const [reclamoAprobar, setReclamoAprobar] = useState<any | null>(null);
    const [reclamoRechazar, setReclamoRechazar] = useState<any | null>(null);
    const aprobarReclamo = async () => {
  if (!reclamoAprobar) return;

const { error } = await supabase
  .from("owner_claims")
  .update({
    status: "approved",
    
  })
  .eq("id", reclamoAprobar.id);

  if (error) {
    console.error("Error al aprobar reclamo:", error);
    return;
  }

await enviarEmailResguardo(reclamoAprobar.id);

onReclamoActualizado(reclamoAprobar.id, "approved");
setReclamoAprobar(null);
};

const rechazarReclamo = async () => {
  if (!reclamoRechazar) return;

  const { error } = await supabase
    .from("owner_claims")
    .update({
      status: "rejected",
    })
    .eq("id", reclamoRechazar.id);

  if (error) {
    console.error("Error al rechazar reclamo:", error);
    return;
  }

  await enviarEmailsRechazoResguardo(reclamoRechazar.id);

  onReclamoActualizado(reclamoRechazar.id, "rejected");

  setReclamoRechazar(null);
};

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
        🔴 Reclamos pendientes
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
            <th style={{ padding: "15px" }}>Fecha recibido</th>
            <th style={{ padding: "15px" }}>Publicación</th>
            <th style={{ padding: "15px" }}>Propietario</th>
            <th style={{ padding: "15px" }}>Teléfono</th>
            <th style={{ padding: "15px" }}>Email</th>
            <th style={{ padding: "15px" }}>Resguardo</th>
            <th style={{ padding: "15px" }}>Inquilino</th>
            <th style={{ padding: "15px" }}>Teléfono</th>
            <th style={{ padding: "15px" }}>Email</th>
            <th style={{ padding: "15px" }}>Fechas de uso</th>
            <th style={{ padding: "15px" }}>Descripción</th>
            <th style={{ padding: "15px" }}>Fotos</th>
            <th style={{ padding: "15px" }}>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {reclamos.length === 0 ? (
            <tr>
              <td
                colSpan={13}
                style={{
                  padding: "30px",
                  textAlign: "center",
                  color: "#999",
                }}
              >
                No hay reclamos pendientes.
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
                <td style={{ padding: "15px" }}>
  {new Date(reclamo.created_at).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })}
</td>

<td style={{ padding: "15px" }}>
  {reclamo.reservas?.[0]?.publications?.titulo || "-"}
</td>

<td style={{ padding: "15px" }}>
  {reclamo.propietario?.nombre || "-"}
</td>

<td style={{ padding: "15px" }}>
  {reclamo.propietario?.telefono || "-"}
</td>

<td style={{ padding: "15px" }}>
  {reclamo.propietario?.email || "-"}
</td>

<td style={{ padding: "15px" }}>
  ${reclamo.reservas?.[0]?.publications?.resguardo || 0}
</td>

<td style={{ padding: "15px" }}>
  {reclamo.reservas?.[0]?.profiles?.nombre || "-"}
</td>

<td style={{ padding: "15px" }}>
  {reclamo.reservas?.[0]?.profiles?.telefono || "-"}
</td>

<td style={{ padding: "15px" }}>
  {reclamo.reservas?.[0]?.profiles?.email || "-"}
</td>

<td style={{ padding: "15px" }}>
  {reclamo.reservas?.map((r:any) => r.fecha).join(", ")}
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
            (img: any) => img.image_url
          )
        )
      }
      style={{
        background: "transparent",
        border: "none",
        color: "#4da3ff",
        cursor: "pointer",
      }}
    >
      📷 Ver fotos ({reclamo.owner_claim_images.length})
    </button>
  ) : (
    "-"
  )}
</td>

<td style={{ padding: "15px" }}>
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      minWidth: "90px",
    }}
  >
    <button
  onClick={() => setReclamoAprobar(reclamo)}
  style={{
        background: "#1f7a3f",
        color: "#FFFFFF",
        border: "none",
        borderRadius: "6px",
        padding: "8px 12px",
        cursor: "pointer",
      }}
    >
      Aprobar
    </button>

    <button
  onClick={() => setReclamoRechazar(reclamo)}
  style={{
        background: "#8b2c2c",
        color: "#FFFFFF",
        border: "none",
        borderRadius: "6px",
        padding: "8px 12px",
        cursor: "pointer",
      }}
    >
      Rechazar
    </button>
  </div>
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

{reclamoAprobar && (
  <ReclamoConfirmModal
  tipo="aprobar"
    monto={reclamoAprobar.reservas?.[0]?.publications?.resguardo || 0}
    propietario={
  reclamoAprobar.reservas?.[0]?.propietario?.nombre ||
  "Propietario"
}
    alias={
      reclamoAprobar.reservas?.[0]?.publications?.alias_pago || null
    }
   onAceptar={aprobarReclamo}
    onCancelar={() => setReclamoAprobar(null)}
  />
)}

{reclamoRechazar && (
  <ReclamoConfirmModal
    tipo="rechazar"
    monto={reclamoRechazar.reservas?.[0]?.publications?.resguardo || 0}
    inquilino={
      reclamoRechazar.reservas?.[0]?.profiles?.nombre ||
      "Inquilino"
    }
    telefono={
      reclamoRechazar.reservas?.[0]?.profiles?.telefono ||
      "Teléfono no disponible"
    }
    onAceptar={rechazarReclamo}
    onCancelar={() => setReclamoRechazar(null)}
  />
)}

    </div>
  );
}
