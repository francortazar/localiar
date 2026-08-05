import { supabase } from "./supabase";
import { sendEmail } from "./sendEmail";

export async function enviarEmailNuevaPregunta(
  publicationId: string,
  pregunta: string
) {
  const { data: publicacion, error } =
    await supabase
      .from("publications")
      .select(`
        id,
        titulo,
        owner:profiles!publications_owner_id_fkey (
          nombre,
          email
        )
      `)
      .eq("id", publicationId)
      .single();

  if (error || !publicacion) {
    console.error(error);
    return;
  }

  const owner = Array.isArray(publicacion.owner)
    ? publicacion.owner[0]
    : publicacion.owner;

  if (!owner) {
    console.error("No se encontró el propietario.");
    return;
  }

  const html = `
    <h2>Nueva pregunta en tu publicación</h2>

    <p>
      Hola <strong>${owner.nombre}</strong>.
    </p>

    <p>
      Un usuario realizó una nueva pregunta en tu publicación:
    </p>

    <p>
      <strong>${publicacion.titulo}</strong>
    </p>

    <blockquote style="
      border-left:4px solid #FF7A00;
      padding-left:15px;
      color:#444;
      font-style:italic;
    ">
      ${pregunta}
    </blockquote>

    <p>
      Ingresá a Localiar para responder la consulta.
    </p>

    <p>
      <a
        href="https://localiar.netlify.app/publicacion/${publicacion.id}"
        style="
          display:inline-block;
          background:#FF7A00;
          color:white;
          text-decoration:none;
          padding:12px 20px;
          border-radius:8px;
          font-weight:bold;
        "
      >
        Ver publicación
      </a>
    </p>
  `;

  await sendEmail({
    to: owner.email,
    subject: "Nueva pregunta en tu publicación",
    html,
  });

  console.log("Email de nueva pregunta enviado.");
}

export async function enviarEmailRespuesta(
  parentId: string,
  respuesta: string
) {
  console.log("Nueva respuesta:", {
    parentId,
    respuesta,
  });
}