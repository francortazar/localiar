
import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { createClient } from "@supabase/supabase-js";
import { enviarEmailsReserva } from "@/app/lib/enviarEmailsReserva";

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log("========== WEBHOOK MERCADO PAGO ==========");
    console.log("BODY:", body);

    const paymentId = body?.data?.id;

    if (!paymentId) {
      console.log("Webhook sin payment ID");

      return NextResponse.json({
        received: true,
      });
    }

    const paymentClient = new Payment(client);

    const payment = await paymentClient.get({
      id: String(paymentId),
    });

    console.log("PAGO MERCADO PAGO:", payment);
    console.log("PAYMENT STATUS:", payment.status);
    console.log(
      "EXTERNAL REFERENCE:",
      payment.external_reference
    );

    if (payment.status !== "approved") {
      console.log("Pago todavía no aprobado.");

      return NextResponse.json({
        received: true,
        approved: false,
      });
    }

    const operacionId = payment.external_reference;

    if (!operacionId) {
      console.error(
        "El pago no tiene external_reference."
      );

      return NextResponse.json({
        received: true,
        approved: false,
      });
    }

    // 1. Buscar la intención de reserva
    const { data: intent, error: intentError } =
      await supabase
        .from("reservation_intents")
        .select("*")
        .eq("operacion_id", operacionId)
        .single();

    if (intentError || !intent) {
      console.error(
        "No se encontró reservation_intent:",
        intentError
      );

      return NextResponse.json(
        {
          error: "Intención no encontrada",
        },
        {
          status: 404,
        }
      );
    }

    console.log(
      "INTENCIÓN ENCONTRADA:",
      intent
    );

    // 2. Evitar duplicar reservas si Mercado Pago
    // envía el webhook más de una vez
    const { data: reservasExistentes } =
      await supabase
        .from("reservations")
        .select("id")
        .eq("operacion_id", operacionId);

    if (
      reservasExistentes &&
      reservasExistentes.length > 0
    ) {
      console.log(
        "Las reservas ya existen para esta operación."
      );

      return NextResponse.json({
        received: true,
        approved: true,
        already_processed: true,
        operacion_id: operacionId,
      });
    }

    // 3. Crear las reservas
    const reservas = intent.fechas.map(
      (fecha: string) => ({
        publication_id: intent.publication_id,
        inquilino_id: intent.tenant_id,
        fecha,
        estado: "confirmada",
        operacion_id: operacionId,
        estado_pago: "pagado",
        fecha_pago_real: new Date().toISOString(),
        destino: "Mercado Pago",
        estado_propietario: "pendiente",
        estado_inquilino: "pendiente",
      })
    );

    const {
      data: reservasCreadas,
      error: reservasError,
    } = await supabase
      .from("reservations")
      .insert(reservas)
      .select();

    if (reservasError || !reservasCreadas) {
      console.error(
        "ERROR CREANDO RESERVAS:",
        reservasError
      );

      return NextResponse.json(
        {
          error: "No se pudieron crear las reservas",
        },
        {
          status: 500,
        }
      );
    }

    console.log(
      "RESERVAS CREADAS:",
      reservasCreadas
    );

    // 4. Crear registro de pago
    const {
      error: paymentError,
    } = await supabase
      .from("reservation_payments")
      .insert([
        {
          reservation_id:
            reservasCreadas[0].id,

          operacion_id: operacionId,

          publication_id:
            intent.publication_id,

          tenant_id:
            intent.tenant_id,

          owner_id:
            (
              await supabase
                .from("publications")
                .select("owner_id")
                .eq(
                  "id",
                  intent.publication_id
                )
                .single()
            ).data?.owner_id,

          amount: intent.total,

          payment_method:
            "Mercado Pago",

          status:
            "Aprobado",

          localiar_fee:
            intent.comision,

          mercado_pago_id:
            String(payment.id),

          mercado_pago_preference_id:
            intent.preference_id,
        },
      ]);

    if (paymentError) {
      console.error(
        "ERROR CREANDO RESERVATION_PAYMENT:",
        paymentError
      );

      return NextResponse.json(
        {
          error:
            "Reserva creada pero no se pudo registrar el pago",
        },
        {
          status: 500,
        }
      );
    }

    console.log(
      "PAGO REGISTRADO CORRECTAMENTE"
    );

    // 5. Marcar intención como confirmada
    const {
      error: updateIntentError,
    } = await supabase
      .from("reservation_intents")
      .update({
        estado: "confirmada",
      })
      .eq(
        "operacion_id",
        operacionId
      );

    if (updateIntentError) {
      console.error(
        "ERROR ACTUALIZANDO INTENCIÓN:",
        updateIntentError
      );

      return NextResponse.json(
        {
          error:
            "Reserva creada pero no se pudo actualizar la intención",
        },
        {
          status: 500,
        }
      );
    }

    console.log(
      "INTENCIÓN MARCADA COMO CONFIRMADA"
    );

    try {
  await enviarEmailsReserva(operacionId);
  console.log("EMAILS DE RESERVA ENVIADOS");
} catch (emailError) {
  console.error(
    "ERROR ENVIANDO EMAILS DE RESERVA:",
    emailError
  );
}

    return NextResponse.json({
      received: true,
      approved: true,
      operacion_id: operacionId,
    });
  } catch (error) {
    console.error(
      "ERROR WEBHOOK MERCADO PAGO:",
      error
    );

    return NextResponse.json(
      {
        error: "Webhook inválido",
      },
      {
        status: 400,
      }
    );
  }
}

