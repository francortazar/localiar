import { supabase } from "./supabase";
import { sendEmail } from "./sendEmail";
import { reservaPropietario } from "./emailTemplates/reservaPropietario";
import { reservaInquilino } from "./emailTemplates/reservaInquilino";

export async function enviarEmailsReserva(
  operacionId: string
) {
  const { data: reservas, error } = await supabase
    .from("reservations")
    .select(`
      *,
      publications (
        id,
        titulo,
        precio_dia,
        resguardo,
        alias_pago,
        profiles (
          id,
          nombre,
          email
        )
      ),
      profiles (
        id,
        nombre,
        email
      )
    `)
    .eq("operacion_id", operacionId)
    .order("fecha", { ascending: true });

  if (error) {
    throw new Error("No se pudo obtener las reservas.");
  }

  if (!reservas || reservas.length === 0) {
    throw new Error("No existen reservas para esa operación.");
  }

  const reserva = reservas[0];

  const propietario = reserva.publications.profiles;
  const inquilino = reserva.profiles;
  const publicacion = reserva.publications;

  const fechasReservadas = reservas.map((r) => r.fecha);

  const cantidadDias = reservas.length;

  const montoAlquilerBase =
    publicacion.precio_dia * cantidadDias;

  const comision =
    montoAlquilerBase * 0.075;

  const montoAlquilerInquilino =
    montoAlquilerBase + comision;

  const montoAlquilerPropietario =
    montoAlquilerBase - comision;

  const montoResguardo =
    publicacion.resguardo;

  const totalPagarInquilino =
    montoAlquilerInquilino + montoResguardo;

  const totalRecibirPropietario =
    montoAlquilerPropietario;

  const htmlPropietario = reservaPropietario({
  nombrePropietario: propietario.nombre,
  nombreInquilino: inquilino.nombre,
  titulo: publicacion.titulo,
  urlPublicacion: `https://localiar.netlify.app/publicacion/${publicacion.id}`,
  fechas: fechasReservadas,
  totalAlquiler: totalRecibirPropietario,
  resguardo: montoResguardo,
});

  await sendEmail({
    to: propietario.email,
    subject: "Nueva reserva en Localiar",
    html: htmlPropietario,
  });

  const htmlInquilino = reservaInquilino({
  nombreInquilino: inquilino.nombre,
  nombrePropietario: propietario.nombre,
  titulo: publicacion.titulo,
  urlPublicacion: `https://localiar.netlify.app/publicacion/${publicacion.id}`,
  fechas: fechasReservadas,
  totalAlquiler: montoAlquilerInquilino,
  resguardo: montoResguardo,
});

  await sendEmail({
    to: inquilino.email,
    subject: "Reserva confirmada en Localiar",
    html: htmlInquilino,
  });

  console.log({
    propietario,
    inquilino,
    titulo: publicacion.titulo,
    fechasReservadas,
    cantidadDias,
    montoAlquilerBase,
    montoAlquilerInquilino,
    montoAlquilerPropietario,
    montoResguardo,
    totalPagarInquilino,
    totalRecibirPropietario,
  });
}