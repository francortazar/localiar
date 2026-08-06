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

  const { data: pregunta, error } =
    await supabase
      .from("publication_messages")
      .select(`
        id,
        texto,
        publication_id,
        user_id,
        profiles (
          nombre,
          email
        ),
        publications (
          titulo
        )
      `)
      .eq("id", parentId)
      .single();


  if (error || !pregunta) {
    console.error(
      "No se pudo obtener la pregunta original",
      error
    );
    return;
  }


  const usuarioPregunta =
    Array.isArray(pregunta.profiles)
      ? pregunta.profiles[0]
      : pregunta.profiles;


  const publicacion =
    Array.isArray(pregunta.publications)
      ? pregunta.publications[0]
      : pregunta.publications;


  if (!usuarioPregunta?.email) {
    console.error(
      "El usuario que preguntó no tiene email"
    );
    return;
  }


  const html = `
    <h2>Respondieron tu pregunta en Localiar</h2>

    <p>
      Hola <strong>${usuarioPregunta.nombre}</strong>.
    </p>

    <p>
      El propietario respondió tu consulta sobre:
    </p>

    <p>
      <strong>${publicacion?.titulo || "Publicación"}</strong>
    </p>

    <blockquote style="
      border-left:4px solid #FF7A00;
      padding-left:15px;
      color:#444;
      font-style:italic;
    ">
      ${respuesta}
    </blockquote>

    <p>
      Ingresá a Localiar para continuar la conversación.
    </p>

    <p>
      <a
        href="https://localiar.netlify.app/publicacion/${pregunta.publication_id}"
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
    to: usuarioPregunta.email,
    subject: "Respondieron tu pregunta en Localiar",
    html,
  });


  console.log(
    "Email de respuesta enviado correctamente."
  );
}