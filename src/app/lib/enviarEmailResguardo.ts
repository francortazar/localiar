import { supabase } from "./supabase";
import { sendEmail } from "./sendEmail";

export async function enviarEmailResguardo(claimId: string) {
  const { data: reclamo, error: errorReclamo } = await supabase
    .from("owner_claims")
    .select(`
      id,
operacion_id,
description,
created_at,
owner_id,
publication_id
    `)
    .eq("id", claimId)
    .single();

  if (errorReclamo || !reclamo) {
    console.error("Error obteniendo reclamo:", errorReclamo);
    return;
  }

  const { data: propietario, error: errorPropietario } = await supabase
    .from("profiles")
    .select("nombre, email")
    .eq("id", reclamo.owner_id)
    .single();

  if (errorPropietario || !propietario) {
    console.error("Error obteniendo propietario:", errorPropietario);
    return;
  }

  const { data: publicacion, error: errorPublicacion } = await supabase
    .from("publications")
    .select("titulo, resguardo")
    .eq("id", reclamo.publication_id)
    .single();

  if (errorPublicacion || !publicacion) {
    console.error("Error obteniendo publicación:", errorPublicacion);
    return;
  }

  const { data: reserva, error: errorReserva } = await supabase
    .from("reservations")
    .select(`
      inquilino_id
    `)
    .eq("operacion_id", reclamo.operacion_id)
    .limit(1)
    .single();

  if (errorReserva || !reserva) {
    console.error("Error obteniendo reserva:", errorReserva);
    return;
  }

  const { data: inquilino, error: errorInquilino } = await supabase
    .from("profiles")
    .select("nombre, email")
    .eq("id", reserva.inquilino_id)
    .single();

  if (errorInquilino || !inquilino) {
    console.error("Error obteniendo inquilino:", errorInquilino);
    return;
  }

  const monto = Number(publicacion.resguardo || 0);

  await sendEmail({
    to: propietario.email,
    subject: "Localiar - Resguardo pagado",
    html: `
      <h2>Resguardo pagado</h2>

      <p>Hola ${propietario.nombre},</p>

      <p>
        Te informamos que el reclamo de resguardo correspondiente a
        <strong>${publicacion.titulo}</strong>
        fue aprobado.
      </p>

      <p>
        Se realizó el pago de:
        <strong>$${monto.toLocaleString("es-AR")}</strong>
      </p>

      <p>
        El importe corresponde al resguardo reclamado por los daños
        informados.
      </p>

      <p>Saludos,<br />Equipo Localiar</p>
    `,
  });

  await sendEmail({
    to: inquilino.email,
    subject: "Localiar - Cobro de resguardo",
    html: `
      <h2>Cobro de resguardo</h2>

      <p>Hola ${inquilino.nombre},</p>

      <p>
        Te informamos que el reclamo de resguardo correspondiente a
        <strong>${publicacion.titulo}</strong>
        fue aprobado.
      </p>

      <p>
        Se realizó un cobro de:
        <strong>$${monto.toLocaleString("es-AR")}</strong>
      </p>

      <p>
        <strong>Motivo del reclamo:</strong>
      </p>

      <p>
        ${reclamo.description}
      </p>

      <p>
        El importe corresponde al resguardo establecido para la publicación.
      </p>

      <p>Saludos,<br />Equipo Localiar</p>
    `,
  });
}