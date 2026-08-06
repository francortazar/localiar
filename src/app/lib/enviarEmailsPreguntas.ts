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
    .select("*")
    .eq("id", parentId)
    .single();

console.log("PREGUNTA:", pregunta);
console.log("ERROR:", error);


  if (error || !pregunta) {
    console.error(
      "No se pudo obtener la pregunta original",
      error
    );
    return;
  }

console.log("========== EMAIL RESPUESTA ==========");
console.log("PREGUNTA:", pregunta);
console.log("PROFILES:", pregunta?.profiles);
console.log("PUBLICATIONS:", pregunta?.publications);
console.log("=====================================");


const { data: usuarioPregunta } =
  await supabase
    .from("profiles")
    .select("nombre, email")
    .eq("id", pregunta.user_id)
    .single();

console.log("USUARIO:", usuarioPregunta);

const { data: publicacion } =
  await supabase
    .from("publications")
    .select("titulo")
    .eq("id", pregunta.publication_id)
    .single();

console.log("PUBLICACION:", publicacion);


console.log("EMAIL:", usuarioPregunta?.email);
console.log("USUARIO COMPLETO:", usuarioPregunta);

if (!usuarioPregunta?.email) {
  console.error("SIN EMAIL");
  return;
}


  const html = `
  <h1>PRUEBA LOCALIAR</h1>

  <p>
    Este es un email de prueba.
  </p>
`;
console.log("VOY A ENVIAR EL EMAIL");
console.log("DESTINATARIO:", usuarioPregunta.email);

const resultado = await sendEmail({
  to: "franciscocortazar02@gmail.com",
  subject: "PRUEBA LOCALIAR",
  html,
});

console.log("RESULTADO SENDMAIL:", resultado);

console.log(
  "Email de respuesta enviado correctamente."
);
}