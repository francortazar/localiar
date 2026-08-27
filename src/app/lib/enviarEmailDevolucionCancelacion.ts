import { supabase } from "./supabase";
import { sendEmail } from "./sendEmail";

export async function enviarEmailDevolucionCancelacion(
  cancelacionId: string,
  emailInquilino: string
) {
  const { data: cancelacion, error } = await supabase
  .from("reservation_cancellations")
  .select(`
    *,
    publications (
      id,
      titulo,
      precio_dia
    )
  `)
  .eq("id", cancelacionId)
  .single();

  if (error) {
    console.error("ERROR OBTENIENDO CANCELACION:", error);
    throw new Error(
      "No se pudieron obtener los datos de la cancelación."
    );
  }

  if (!cancelacion) {
    throw new Error("No existe la cancelación.");
  }

const publicacion = cancelacion.publications;

const inquilino = {
  nombre: "inquilino",
  email: emailInquilino,
};

  if (!inquilino?.email) {
    throw new Error(
      "El inquilino no tiene un email registrado."
    );
  }

  const montoDevuelto = Number(
    cancelacion.monto_devolver || 0
  );

  const fechas = cancelacion.fechas || [];

  const fechasTexto = fechas
    .map((fecha: string) => {
      const partes = fecha.split("-");

      if (partes.length !== 3) {
        return fecha;
      }

      return `${partes[2]}/${partes[1]}/${partes[0]}`;
    })
    .join(", ");

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222;">

      <h2>Reembolso realizado</h2>

      <p>Hola ${inquilino.nombre},</p>

      <p>
        Te informamos que se realizó correctamente el
        reembolso correspondiente a la cancelación de tu reserva.
      </p>

      <p>
        <strong>Publicación:</strong>
        ${publicacion?.titulo || ""}
      </p>

      <p>
        <strong>Fecha/s cancelada/s:</strong>
        ${fechasTexto || "-"}
      </p>

      <p>
        <strong>Monto reembolsado:</strong>
        $${montoDevuelto.toLocaleString("es-AR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </p>

      <p>
        El monto indicado corresponde al importe que Localiar
        registró como devuelto por esta cancelación.
      </p>

      <p>
        Saludos,<br />
        <strong>Localiar</strong>
      </p>

    </div>
  `;

  await sendEmail({
    to: inquilino.email,
    subject: "Se realizó el reembolso de tu reserva",
    html,
  });

  console.log(
    "Email de reembolso enviado al inquilino",
    {
      cancelacionId,
      email: inquilino.email,
      montoDevuelto,
      fechas,
    }
  );
}