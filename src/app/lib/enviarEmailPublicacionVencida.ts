import { supabase } from "./supabase";
import { sendEmail } from "./sendEmail";

export async function enviarEmailPublicacionVencida(
  publicationId: string
) {
  const { data: publicacion, error } =
    await supabase
      .from("publications")
      .select(`
        id,
        titulo,
        profiles!publications_owner_id_fkey (
          nombre,
          email
        )
      `)
      .eq("id", publicationId)
      .single();

  if (error) {
    console.error(
      "ERROR OBTENIENDO PUBLICACIÓN VENCIDA:",
      error
    );

    throw new Error(
      "No se pudieron obtener los datos de la publicación."
    );
  }

  if (!publicacion) {
    throw new Error(
      "No existe la publicación indicada."
    );
  }

  const propietario = Array.isArray(
    publicacion.profiles
  )
    ? publicacion.profiles[0]
    : publicacion.profiles;

  if (!propietario?.email) {
    throw new Error(
      "El propietario no tiene un email registrado."
    );
  }

  const html = `
    <div
      style="
        font-family: Arial, sans-serif;
        max-width: 600px;
        margin: auto;
        color: #222;
        line-height: 1.6;
      "
    >
      <div
        style="
          background: #0D1F3D;
          padding: 20px;
          text-align: center;
          border-radius: 10px 10px 0 0;
        "
      >
        <h2
          style="
            color: #FF7A00;
            margin: 0;
          "
        >
          LOCALIAR
        </h2>
      </div>

      <div
        style="
          padding: 25px;
          background: #ffffff;
        "
      >
        <p>
          Hola
          <strong>
            ${propietario.nombre || "-"}
          </strong>,
        </p>

        <p>
          Te informamos que tu publicación
          <strong>
            ${publicacion.titulo}
          </strong>
          ya no tenía fechas futuras disponibles.
        </p>

        <p>
          Por este motivo, la publicación fue retirada
          de Localiar.
        </p>

        <p>
          Si querés volver a ofrecer este espacio,
          podés crear una nueva publicación con las
          fechas disponibles actualizadas.
        </p>

        <div
          style="
            text-align: center;
            margin: 30px 0;
          "
        >
          <a
            href="https://localiar.com/publicar"
            style="
              display: inline-block;
              background: #FF7A00;
              color: #ffffff;
              text-decoration: none;
              padding: 14px 28px;
              border-radius: 8px;
              font-weight: bold;
              font-size: 16px;
            "
          >
            📢 Volver a publicar mi espacio
          </a>
        </div>

        <p>
          Desde allí podés crear nuevamente tu publicación
          y cargar las nuevas fechas disponibles.
        </p>
      </div>

      <div
        style="
          padding: 20px;
          background: #f5f5f5;
          text-align: center;
          border-radius: 0 0 10px 10px;
        "
      >
        <p
          style="
            margin: 0;
            font-size: 12px;
            color: #777;
          "
        >
          Este es un correo automático de Localiar.
        </p>
      </div>
    </div>
  `;

  await sendEmail({
    to: propietario.email,
    subject:
      "Tu publicación finalizó - Localiar",
    html,
  });

  console.log(
    "Email de publicación vencida enviado",
    {
      publicationId,
      email: propietario.email,
      titulo: publicacion.titulo,
    }
  );
}