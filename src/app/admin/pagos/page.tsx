"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import ReclamosTable from "./components/ReclamosTable";
import ReclamosHistorialTable from "./components/ReclamosHistorialTable";
import PagosFilters from "./components/PagosFilters";
import PagosTable from "./components/PagosTable";
import PagosResumen from "./components/PagosResumen";
import CancelacionesTable from "./components/CancelacionesTable";
import PagosHistorialTable from "./components/PagosHistorialTable";
import HistorialCancelacionesTable from "./components/HistorialCancelacionesTable";



    export default function PagosPage() {
  const [operaciones, setOperaciones] = useState<any[]>([]);
  const [historial, setHistorial] = useState<any[]>([]);
  const [reclamos, setReclamos] = useState<any[]>([]);
  const [historialReclamos, setHistorialReclamos] = useState<any[]>([]);
  const [cancelaciones, setCancelaciones] = useState<any[]>([]);
  const [historialCancelaciones, setHistorialCancelaciones] = useState<any[]>([]);

  useEffect(() => {
    async function cargarPagos() {
      const { data, error } = await supabase
  .from("reservations")
  .select(`
  id,
  operacion_id,
  fecha,
  estado,
  destino,
  publications (
    titulo,
    precio_dia,
    owner_id,
    alias_pago,
    profiles (
      nombre,
      email,
      telefono
    )
  )
`)
        .eq("estado", "confirmada")
        .eq("estado_pago", "pagar");

      if (error) {
        console.error("Error cargando pagos:", error);
        return;
      }
console.log(data);
      const operacionesAgrupadas = Object.values(
  (data || []).reduce((acc: any, reserva: any) => {
    if (!acc[reserva.operacion_id]) {
      acc[reserva.operacion_id] = {
  ...reserva,
  fechas: [reserva.fecha],
};
    } else {
      acc[reserva.operacion_id].fechas.push(reserva.fecha);
    }

    return acc;
  }, {})
);

operacionesAgrupadas.forEach((operacion: any) => {
  operacion.fechas.sort();

  operacion.cantidadDias = operacion.fechas.length;

  operacion.fechaInicio = operacion.fechas[0];

  operacion.fechaFin =
    operacion.fechas[operacion.fechas.length - 1];

  const fechaPago = new Date(operacion.fechaFin);
fechaPago.setDate(fechaPago.getDate() + 1);

operacion.fechaPago = fechaPago.toLocaleDateString("es-AR");
});



operacionesAgrupadas.sort((a: any, b: any) => {

  const convertirFecha = (fecha: string) => {
    const partes = fecha.split("/");

    return new Date(
      Number(partes[2]),
      Number(partes[1]) - 1,
      Number(partes[0])
    );
  };

  return (
    convertirFecha(a.fechaPago).getTime() -
    convertirFecha(b.fechaPago).getTime()
  );

});

console.log("Operaciones agrupadas:", operacionesAgrupadas);

setOperaciones(operacionesAgrupadas);

      const { data: dataHistorial, error: errorHistorial } = await supabase
  .from("reservations")
  .select(`
  id,
  operacion_id,
  fecha,
  fecha_pago_real,
  estado_pago,
  destino,
    publications (
  titulo,
  precio_dia,
  owner_id,
  alias_pago,
  profiles (
    nombre,
    email,
    telefono
  )
)
  `)
  .eq("estado_pago", "pagado");

if (errorHistorial) {
  console.error("Error cargando historial:", errorHistorial);
  return;
}
const historialAgrupado = Object.values(
  (dataHistorial || []).reduce((acc: any, reserva: any) => {
    if (!acc[reserva.operacion_id]) {
      acc[reserva.operacion_id] = {
        ...reserva,
        fechas: [reserva.fecha],
      };
    } else {
      acc[reserva.operacion_id].fechas.push(reserva.fecha);
    }

    return acc;
  }, {})
);

historialAgrupado.forEach((operacion: any) => {
  operacion.fechas.sort();

  operacion.cantidadDias = operacion.fechas.length;

  operacion.fechaInicio = operacion.fechas[0];

  operacion.fechaFin =
    operacion.fechas[operacion.fechas.length - 1];
});

historialAgrupado.sort((a:any, b:any) => {

  const fechaA = new Date(
    a.fecha_pago_real
  );

  const fechaB = new Date(
    b.fecha_pago_real
  );

  return fechaB.getTime() - fechaA.getTime();

});

console.log("Historial agrupado:", historialAgrupado);

setHistorial(historialAgrupado);

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

const reclamosCompletos = await Promise.all(
  (dataReclamos || []).map(async (reclamo: any) => {
    const { data: reservas, error: errorReservas } = await supabase
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
  owner_id,
  alias_pago,
  profiles (
    
      nombre,
      telefono,
      email
    )
  )
`)
      .eq("operacion_id", reclamo.operacion_id);

    if (errorReservas) {
  console.error("Mensaje:", errorReservas.message);
  console.error("Código:", errorReservas.code);
  console.error("Detalles:", errorReservas.details);
  console.error("Hint:", errorReservas.hint);

  return reclamo;
}

    return {
      ...reclamo,
      reservas: reservas || [],
    };
  })
);

console.log("Reclamos completos:", reclamosCompletos);

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
        Pagos y Garantías
      </h1>

      <p
        style={{
          color: "#999",
          marginBottom: "30px",
        }}
      >
        Administrá pagos, fondos de resguardo y transferencias.
      </p>

<PagosResumen operaciones={operaciones} />

<PagosFilters />

<PagosTable operaciones={operaciones} />

<PagosHistorialTable operaciones={historial} />

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

<ReclamosTable reclamos={reclamos} />

<ReclamosHistorialTable reclamos={historialReclamos} />
    </div>
  );
}