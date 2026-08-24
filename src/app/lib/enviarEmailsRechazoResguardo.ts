import { supabase } from "./supabase";
import { sendEmail } from "./sendEmail";

export async function enviarEmailsRechazoResguardo(
  claimId: string
) {
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

  const { data: propietario, error: errorPropietario } =
    await supabase
      .from("profiles")
      .select("nombre, email")
      .eq("id", reclamo.owner_id)
      .single();

  if (errorPropietario || !propietario) {
    console.error(
      "Error obteniendo propietario:",
      errorPropietario
    );
    return;
  }

  const { data: publicacion, error: errorPublicacion } =
    await supabase
      .from("publications")
      .select("titulo, resguardo")
      .eq("id", reclamo.publication_id)
      .single();

  if (errorPublicacion || !publicacion) {
    console.error(
      "Error obteniendo publicación:",
      errorPublicacion
    );
    return;
  }

  const { data: reserva, error: errorReserva } =
    await supabase
      .from("reservations")
      .select(`
        inquilino_id
      `)
      .eq("operacion_id", reclamo.operacion_id)
      .limit(1)
      .single();

  if (errorReserva || !reserva) {
    console.error(
      "Error obteniendo reserva:",
      errorReserva
    );
    return;
  }

  const { data: inquilino, error: errorInquilino } =
    await supabase
      .from("profiles")
      .select("nombre, email")
      .eq("id", reserva.inquilino_id)
      .single();

  if (errorInquilino || !inquilino) {
    console.error(
      "Error obteniendo inquilino:",
      errorInquilino
    );
    return;
  }

  const monto = Number(publicacion.resguardo || 0);

  // EMAIL AL PROPIETARIO

  await sendEmail({
    to: propietario.email,
    subject: "Localiar - Reclamo de resguardo rechazado",
    html: `
      <h2>Reclamo de resguardo rechazado</h2>

      <p>Hola ${propietario.nombre},</p>

      <p>
        Te informamos que el reclamo de resguardo correspondiente a
        <strong>${publicacion.titulo}</strong>
        fue rechazado por la administración de Localiar.
      </p>

      <p>
        El reclamo correspondía a un monto de:
        <strong>$${monto.toLocaleString("es-AR")}</strong>
      </p>

      <p>
        En consecuencia, no se realizará el cobro del resguardo
        correspondiente a este reclamo.
      </p>

      <p>
        <strong>Motivo informado en el reclamo:</strong>
      </p>

      <p>
        ${reclamo.description}
      </p>

      <p>
        Si considerás que existe un error, podés comunicarte
        con la administración de Localiar.
      </p>

      <p>
        Saludos,<br />
        Equipo Localiar
      </p>
    `,
  });

  // EMAIL AL INQUILINO

  await sendEmail({
    to: inquilino.email,
    subject: "Localiar - Reclamo de resguardo rechazado",
    html: `
      <h2>Reclamo de resguardo rechazado</h2>

      <p>Hola ${inquilino.nombre},</p>

      <p>
        Te informamos que el reclamo de resguardo correspondiente a
        <strong>${publicacion.titulo}</strong>
        fue revisado por la administración de Localiar
        y <strong>rechazado</strong>.
      </p>

      <p>
        Por lo tanto, <strong>no se realizará ningún cobro
        de resguardo</strong> correspondiente a este reclamo.
      </p>

      <p>
        <strong>Motivo informado por el propietario:</strong>
      </p>

      <p>
        ${reclamo.description}
      </p>

      <p>
        Saludos,<br />
        Equipo Localiar
      </p>
    `,
  });
}