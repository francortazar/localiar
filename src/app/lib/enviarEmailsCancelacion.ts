import { supabase } from "./supabase";
import { sendEmail } from "./sendEmail";
import { cancelacionInquilino } from "./emailTemplates/cancelacionInquilino";
import { cancelacionPropietario } from "./emailTemplates/cancelacionPropietario";

export async function enviarEmailsCancelacion(
  operacionId: string
) {
  const { data: cancelacion, error } = await supabase
    .from("reservation_cancellations")
    .select(`
      *,
      publications (
        id,
        titulo
      ),
      owner:profiles!reservation_cancellations_owner_fkey (
        nombre,
        email
      ),
      inquilino:profiles!reservation_cancellations_inquilino_fkey (
        nombre,
        email
      )
    `)
    .eq("operacion_id", operacionId)
    .single();

  if (error) {
    console.error(error);
    throw new Error(
      "No se pudieron obtener los datos de la cancelación."
    );
  }

  if (!cancelacion) {
    throw new Error(
      "No existe una cancelación para esa operación."
    );
  }

  const publicacion = cancelacion.publications;
  const propietario = cancelacion.owner;
  const inquilino = cancelacion.inquilino;

  const fechas = cancelacion.fechas || [];

  const cantidadDias = cancelacion.cantidad_dias;

  const totalAlquiler =
    Number(cancelacion.precio_dia) * cantidadDias;

  const comision =
    Number(cancelacion.comision);

  const resguardo =
    Number(cancelacion.resguardo);

  const urlPublicacion =
    `https://localiar.netlify.app/publicacion/${publicacion.id}`;


  const htmlInquilino =
    cancelacionInquilino({
      nombreInquilino: inquilino.nombre,
      nombrePropietario: propietario.nombre,
      titulo: publicacion.titulo,
      urlPublicacion,
      fechas,
      totalAlquiler,
      comision,
      resguardo,
      canceladoPor: cancelacion.cancelado_por,
    });


  const htmlPropietario =
    cancelacionPropietario({
      nombrePropietario: propietario.nombre,
      nombreInquilino: inquilino.nombre,
      titulo: publicacion.titulo,
      urlPublicacion,
      fechas,
      totalAlquiler,
      resguardo,
    });


  if (cancelacion.cancelado_por === "inquilino") {

    await sendEmail({
      to: inquilino.email,
      subject: "Confirmaste la cancelación de tu reserva",
      html: htmlInquilino,
    });


    await sendEmail({
      to: propietario.email,
      subject: "Un inquilino canceló una reserva",
      html: htmlPropietario,
    });


  } else {


    await sendEmail({
      to: propietario.email,
      subject: "Confirmaste la cancelación de una reserva",
      html: htmlPropietario,
    });


    await sendEmail({
      to: inquilino.email,
      subject: "El propietario canceló tu reserva",
      html: htmlInquilino,
    });

  }


  console.log("Emails de cancelación enviados", {
    operacionId,
    canceladoPor: cancelacion.cancelado_por,
    propietario,
    inquilino,
  });
}