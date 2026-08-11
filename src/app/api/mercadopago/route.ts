
import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

export async function POST(request: Request) {
  try {
    const {
      title,
      quantity,
      unit_price,
      operacion_id,
    } = await request.json();

    const preference = new Preference(client);

    const response = await preference.create({
      body: {
        items: [
          {
            id: operacion_id,
            title,
            quantity,
            currency_id: "ARS",
            unit_price,
          },
        ],

        external_reference: operacion_id,

        notification_url:
          "https://localiar.com/api/mercadopago-webhook",

        back_urls: {
          success: "https://localiar.com/perfil",
          failure: "https://localiar.com/perfil",
          pending: "https://localiar.com/perfil",
        },

        auto_return: "approved",
      },
    });

    return NextResponse.json({
      id: response.id,
      init_point: response.init_point,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "No se pudo crear la preferencia",
      },
      {
        status: 500,
      }
    );
  }
}

