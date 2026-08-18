import { supabase } from "./supabase";
import { sendEmail } from "./sendEmail";
import { pagoPropietario } from "./emailTemplates/pagoPropietario";

export async function enviarEmailPagoPropietario(
  reservationPaymentId: string
) {
  const { data: pago, error } = await supabase
    .from("reservation_payments")
    .select(`
      id,
      reservation_id,
      publication_id,
      owner_id,
      owner_paid_at,

      owner:profiles!owner_id(
        nombre,
        email
      ),

      publications(
        titulo,
        alias_pago
      ),

      reservations(
        fecha,
        operacion_id
      )
    `)
    .eq("id", reservationPaymentId)
    .single();

  if (error) {
    console.error(
      "ERROR OBTENIENDO DATOS DEL PAGO:",
      error
    );

    throw new Error(
      "No se pudieron obtener los datos del pago."
    );
  }

  if (!pago) {
    throw new Error(
      "No existe el pago indicado."
    );
  }

  const propietario = Array.isArray(pago.owner)
    ? pago.owner[0]
    : pago.owner;

  const publicacion = Array.isArray(pago.publications)
    ? pago.publications[0]
    : pago.publications;

  const reserva = Array.isArray(pago.reservations)
    ? pago.reservations[0]
    : pago.reservations;

  if (!propietario?.email) {
    throw new Error(
      "El propietario no tiene un email registrado."
    );
  }

  /*
   * Obtenemos todas las fechas contratadas
   * correspondientes a la operación.
   */
  let fechas: string[] = [];

  if (reserva?.operacion_id) {
    const { data: reservasOperacion, error: fechasError } =
      await supabase
        .from("reservations")
        .select("fecha")
        .eq(
          "operacion_id",
          reserva.operacion_id
        )
        .eq(
          "estado_propietario",
          "aceptada"
        )
        .order("fecha", {
          ascending: true,
        });

    if (fechasError) {
      console.error(
        "ERROR OBTENIENDO FECHAS DEL PAGO:",
        fechasError
      );

      throw new Error(
        "No se pudieron obtener las fechas de la reserva."
      );
    }

    fechas =
      reservasOperacion?.map(
        (reservaFecha: any) =>
          new Date(
            `${reservaFecha.fecha}T00:00:00`
          ).toLocaleDateString("es-AR")
      ) || [];
  }

  /*
   * Calculamos exactamente el mismo importe
   * que mostramos en la tabla de pagos a propietarios.
   */
  const { data: pagoCompleto, error: pagoError } =
    await supabase
      .from("reservation_payments")
      .select(`
        amount,
        publications(
          resguardo
        )
      `)
      .eq("id", reservationPaymentId)
      .single();

  if (pagoError) {
    console.error(
      "ERROR OBTENIENDO IMPORTE DEL PAGO:",
      pagoError
    );

    throw new Error(
      "No se pudo obtener el importe del pago."
    );
  }

  const totalCobrado =
    Number(pagoCompleto?.amount || 0);

  const publicacionPago = Array.isArray(
  pagoCompleto?.publications
)
  ? pagoCompleto.publications[0]
  : pagoCompleto?.publications;

const resguardo =
  Number(
    publicacionPago?.resguardo || 0
  );

  const alquilerConComision =
    totalCobrado - resguardo;

  const alquilerBase =
    alquilerConComision / 1.075;

  const cobraPropietario =
    alquilerBase * 0.925;

  const importe = new Intl.NumberFormat(
    "es-AR",
    {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }
  ).format(cobraPropietario);

  const fechaPago =
    pago.owner_paid_at
      ? new Date(
          pago.owner_paid_at
        ).toLocaleDateString("es-AR")
      : new Date().toLocaleDateString("es-AR");

  const reservaId =
    `#${String(
      pago.reservation_id
    ).slice(0, 8)}`;

  const html =
    pagoPropietario({
      nombrePropietario:
        propietario.nombre || "-",

      titulo:
        publicacion?.titulo || "-",

      alias:
        publicacion?.alias_pago || "-",

      importe,

      fechas,

      fechaPago,

      reserva: reservaId,
    });

  await sendEmail({
    to: propietario.email,
    subject:
      "Pago acreditado - Localiar",
    html,
  });

  console.log(
    "Email de pago enviado al propietario",
    {
      reservationPaymentId,
      email: propietario.email,
      importe,
      alias: publicacion?.alias_pago,
    }
  );
}