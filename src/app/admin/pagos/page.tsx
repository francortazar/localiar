"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import ReclamosTable from "./components/ReclamosTable";
import ReclamosHistorialTable from "./components/ReclamosHistorialTable";



import CancelacionesTable from "./components/CancelacionesTable";

import HistorialCancelacionesTable from "./components/HistorialCancelacionesTable";



    export default function PagosPage() {
  

  const [reclamos, setReclamos] = useState<any[]>([]);
  const [historialReclamos, setHistorialReclamos] = useState<any[]>([]);
  const [cancelaciones, setCancelaciones] = useState<any[]>([]);
  const [historialCancelaciones, setHistorialCancelaciones] = useState<any[]>([]);

  useEffect(() => {
    async function cargarPagos() {
      

const {
  data: dataCancelaciones,
  error: errorCancelaciones,
} = await supabase
  .from("reservation_cancellations")
  .select(`
    *,
    publications (
  titulo,
  precio_dia,
  resguardo
),
    owner:profiles!reservation_cancellations_owner_fkey (
      nombre
    ),
    inquilino:profiles!reservation_cancellations_inquilino_fkey (
      nombre
    )
  `)
  .eq("estado", "pendiente")
.eq("estado_pago", "pendiente")
.order("fecha_cancelacion", {
  ascending: false,
});

if (errorCancelaciones) {
  console.error(
    "Error cargando cancelaciones:",
    errorCancelaciones
  );
  return;
}

setCancelaciones(dataCancelaciones || []);

const {
  data: dataHistorialCancelaciones,
  error: errorHistorialCancelaciones,
} = await supabase
  .from("reservation_cancellations")
  .select(`
    *,
    publications (
      titulo,
      precio_dia,
      resguardo
    ),
    owner:profiles!reservation_cancellations_owner_fkey (
      nombre
    ),
    inquilino:profiles!reservation_cancellations_inquilino_fkey (
      nombre
    )
  `)
  .eq("estado", "pendiente")
  .eq("estado_pago", "pagado")
  .order("fecha_cancelacion", {
    ascending: false,
  });


if (errorHistorialCancelaciones) {
  console.error(
    "Error cargando historial cancelaciones:",
    errorHistorialCancelaciones
  );
  return;
}

setHistorialCancelaciones(
  dataHistorialCancelaciones || []
);

const { data: dataReclamos, error: errorReclamos } = await supabase
  .from("owner_claims")
  .select(`
    id,
    operacion_id,
    owner_id,
    description,
    status,
    created_at,
    owner_claim_images (
      id,
      image_url
    )
  `)
  .eq("status", "pending")
  .order("created_at", { ascending: false });

if (errorReclamos) {
  console.error("Error cargando reclamos:", errorReclamos);
  return;
}
console.log("OPERACION_ID DEL RECLAMO:", dataReclamos?.[0]?.operacion_id);
console.log("RECLAMO COMPLETO:", dataReclamos?.[0]);

const reclamosCompletos = await Promise.all(
  (dataReclamos || []).map(async (reclamo: any) => {

    const { data: reservas, error: errorReservas } = await supabase
  .from("reservations")
  .select(`
    id,
    fecha,
    inquilino_id,
    publication_id,
    profiles!reservations_inquilino_id_fkey (
      nombre,
      telefono,
      email
    )
  `)
  .eq("operacion_id", reclamo.operacion_id);

if (errorReservas) {
  console.error("ERROR RESERVA:", errorReservas);
}

const reservasConPublicacion = await Promise.all(
  (reservas || []).map(async (reserva: any) => {
    const { data: publicacion } = await supabase
      .from("publications")
      .select(`
        titulo,
        resguardo,
        owner_id,
        alias_pago
      `)
      .eq("id", reserva.publication_id)
      .single();

    return {
      ...reserva,
      publications: publicacion,
    };
  })
);

    if (errorReservas) {
      console.error("ERROR RESERVA:", errorReservas);
    }
    const { data: propietario, error: errorPropietario } = await supabase
  .from("profiles")
  .select(`
    nombre,
    telefono,
    email
  `)
  .eq("id", reclamo.owner_id)
  .single();

if (errorPropietario) {
  console.error("ERROR PROPIETARIO:", errorPropietario);
}

return {
  ...reclamo,
  reservas: reservasConPublicacion,
  propietario: propietario || null,
};
  })
);

console.log(
  "PRUEBA RECLAMO:",
  JSON.stringify(reclamosCompletos, null, 2)
);

setReclamos(reclamosCompletos);

const { data: dataHistorialReclamos, error: errorHistorialReclamos } =
  await supabase
    .from("owner_claims")
    .select(`
      id,
      operacion_id,
      owner_id,
      description,
      status,
      created_at,
      owner_claim_images (
        id,
        image_url
      )
    `)
    .in("status", ["approved", "rejected"])
    .order("created_at", { ascending: false });

if (errorHistorialReclamos) {
  console.error(
    "Error cargando historial de reclamos:",
    errorHistorialReclamos
  );
  return;
}
console.log("Historial reclamos:", dataHistorialReclamos);

const historialReclamosCompletos = await Promise.all(
  (dataHistorialReclamos || []).map(async (reclamo: any) => {
    const { data: reservas, error: errorReservasHistorial } =
      await supabase
        .from("reservations")
        .select(`
          id,
          fecha,
          inquilino_id,
          profiles!reservations_inquilino_id_fkey (
            nombre,
            telefono,
            email
          ),
          publications (
            titulo,
            resguardo,
            alias_pago,
            profiles (
              nombre,
              telefono,
              email
            )
          )
        `)
        .eq("operacion_id", reclamo.operacion_id);

    if (errorReservasHistorial) {
      console.error(
        "Error cargando reservas historial:",
        errorReservasHistorial
      );

      return reclamo;
    }

    return {
      ...reclamo,
      reservas: reservas || [],
    };
  })
);

console.log(
  "Historial reclamos completo:",
  historialReclamosCompletos
);

setHistorialReclamos(historialReclamosCompletos);

    }

    cargarPagos();
  }, []);

console.log("Estado historial reclamos:", historialReclamos);

  return (
    <div>

<button
  onClick={() => window.location.href = "/admin"}
  style={{
    background: "transparent",
    border: "1px solid #333",
    color: "#FFFFFF",
    padding: "10px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    marginBottom: "20px",
  }}
>
  ← Volver al panel de administrador
</button>

      <h1
        style={{
          color: "#FFFFFF",
          marginBottom: "10px",
        }}
      >
        Garantías y cancelaciones
      </h1>

      <p
        style={{
          color: "#999",
          marginBottom: "30px",
        }}
      >
        Administrá pagos, fondos de resguardo y transferencias.
      </p>









<CancelacionesTable
  cancelaciones={cancelaciones}
  onPagoRealizado={(id) => {
    setCancelaciones((prev) =>
      prev.filter((c) => c.id !== id)
    );
  }}
/>

<HistorialCancelacionesTable
  historialCancelaciones={historialCancelaciones}
/>

<ReclamosTable
  reclamos={reclamos}
  onReclamoActualizado={(id) => {
  const reclamoActualizado = reclamos.find(
    (reclamo) => reclamo.id === id
  );

  if (reclamoActualizado) {
    setHistorialReclamos((prev) => [
      {
        ...reclamoActualizado,
        status: reclamoActualizado.status,
      },
      ...prev,
    ]);
  }

  setReclamos((prev) =>
    prev.filter((reclamo) => reclamo.id !== id)
  );
}}
/>

<ReclamosHistorialTable reclamos={historialReclamos} />
    </div>
  );
}