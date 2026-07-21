"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function ReservasAdminPage() {

  const [reservasPendientes, setReservasPendientes] = useState<any[]>([]);
  const [reservasFinalizadas, setReservasFinalizadas] = useState<any[]>([]);
  const [reservasCanceladas, setReservasCanceladas] = useState<any[]>([]);  
  const [reservas, setReservas] = useState<any[]>([]);

  useEffect(() => {
    cargarReservas();
  }, []);

  async function cargarReservas() {
  const { data, error } = await supabase
    .from("reservations")
    .select(`
      id,
      operacion_id,
      fecha,
      estado,
      estado_propietario,
      estado_inquilino,
      publications (
        titulo,
        owner_id
      )
    `)
    .eq("estado", "confirmada")
    .order("fecha");

    
  if (error) {
    console.error("Error cargando reservas:", error);
    return;
  }

  const { data: cancelaciones, error: errorCancelaciones } =
  await supabase
    .from("reservation_cancellations")
    .select(`
      id,
      operacion_id,
      publication_id,
      fecha_cancelacion,
      cancelado_por,
      cantidad_dias,
      fechas,
      publications (
        titulo
      )
    `)
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

  console.log(data);

  const operacionesAgrupadas = Object.values(
  (data || []).reduce((acc: any, reserva: any) => {
    if (!acc[reserva.operacion_id]) {
      acc[reserva.operacion_id] = {
        operacion_id: reserva.operacion_id,
        publicacion: reserva.publications?.titulo,
        fechas: [],
      };
    }

    acc[reserva.operacion_id].fechas.push({
      id: reserva.id,
      fecha: reserva.fecha,
      estado_propietario: reserva.estado_propietario,
      estado_inquilino: reserva.estado_inquilino,
    });

    return acc;
  }, {})
);

const cancelacionesAgrupadas =
  (cancelaciones || []).map((c: any) => ({
    operacion_id: c.operacion_id,
    publicacion: c.publications?.titulo,
    cancelada: true,
    cancelado_por: c.cancelado_por,
    fecha_cancelacion: c.fecha_cancelacion,
    cantidad_dias: c.cantidad_dias,
    fechas: (c.fechas || []).map(
  (f: string, index: number) => ({
    id: index,
    fecha: f,
  })
),
  }));


const activas = operacionesAgrupadas as any[];

const hoy = new Date();

const pendientes = activas.filter((r:any) => {
  const ultimaFecha = [...r.fechas]
    .map((f:any) => f.fecha)
    .sort()
    .at(-1);

  return (
    new Date(
      ultimaFecha + "T23:59:59"
    ) >= hoy
  );
});


const finalizadas = activas.filter((r:any) => {
  const ultimaFecha = [...r.fechas]
    .map((f:any) => f.fecha)
    .sort()
    .at(-1);

  return (
    new Date(
      ultimaFecha + "T23:59:59"
    ) < hoy
  );
});

console.log("OPERACIONES ACTIVAS:", activas);
activas.forEach((r:any) => {
  console.log("REVISION FECHA:", {
    operacion: r.operacion_id,
    fechas: r.fechas,
    ultimaFecha: [...r.fechas].sort().at(-1),
  });
});
console.log("PENDIENTES:", pendientes);
console.log("FINALIZADAS:", finalizadas);
console.log("CANCELADAS:", cancelacionesAgrupadas);

setReservasPendientes(pendientes);
setReservasFinalizadas(finalizadas);
setReservasCanceladas(cancelacionesAgrupadas);




}

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Reservas</h1>

        <Link
          href="/admin"
          className="rounded bg-gray-700 px-4 py-2 text-white hover:bg-gray-800"
        >
          ← Volver al administrador
        </Link>
      </div>

      <div className="rounded-lg border bg-white p-4">
        <h2 className="mb-4 text-lg font-semibold">
  Reservas y cancelaciones
</h2>

        <h2 className="mb-4 text-lg font-semibold">
  Reservas pendientes
</h2>

<TablaReservas
  titulo="Pendientes"
  reservas={reservasPendientes}
/>


<h2 className="mt-8 mb-4 text-lg font-semibold">
  Reservas finalizadas
</h2>

<TablaReservas
  titulo="Finalizadas"
  reservas={reservasFinalizadas}
/>


<h2 className="mt-8 mb-4 text-lg font-semibold">
  Reservas canceladas
</h2>

<TablaReservas
  titulo="Canceladas"
  reservas={reservasCanceladas}
/>
      </div>
    </div>
  );
}
function TablaReservas({
  titulo,
  reservas,
}: {
  titulo: string;
  reservas: any[];
}) {
  return (
    <div className="rounded-lg border bg-white p-4 mb-6">

      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        {titulo}
      </h2>

      <div className="overflow-x-auto">

        <table className="min-w-full border border-gray-300 text-gray-900">

          <thead className="bg-gray-200">
            <tr>
  <th className="border p-2 text-left">
    Publicación
  </th>

  <th className="border p-2 text-left">
    Fechas
  </th>

  <th className="border p-2 text-center">
    Estado
  </th>

  {titulo === "Canceladas" && (
    <th className="border p-2 text-center">
      Fecha cancelación
    </th>
  )}
</tr>
          </thead>


          <tbody>

          {reservas.map((r:any) => (

            <tr key={`${r.operacion_id}-${r.cancelado_por || "reserva"}`}>

              <td className="border p-2">
                {r.publicacion}
              </td>


              <td className="border p-2">

                {r.fechas?.map((f:any) => (

                  <div key={f.id || f.fecha}>
                    {f.fecha}
                  </div>

                ))}

              </td>


              <td className="border p-2 text-center">

                {r.cancelada ? (

                  <span className="text-red-600 font-semibold">

                    🔴 Cancelada por {r.cancelado_por}

                  </span>

                ) : (

                  <span className="text-green-600 font-semibold">

                    🟢 Activa

                  </span>

                )}

              </td>
{titulo === "Canceladas" && (
  <td className="border p-2 text-center">
    {new Date(r.fecha_cancelacion).toLocaleString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })}
  </td>
)}


            </tr>

          ))}


          </tbody>

        </table>

      </div>

    </div>
  );
}