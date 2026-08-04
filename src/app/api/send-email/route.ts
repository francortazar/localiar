import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { to, subject, html } = await request.json();

    const { data, error } = await resend.emails.send({
      from: "Localiar <onboarding@resend.dev>",
      to,
      subject,
      html,
    });

    if (error) {
      console.error(error);

      return NextResponse.json(
        {
          ok: false,
          mensaje: "Error enviando email.",
          error,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      mensaje: "Email enviado correctamente.",
      data,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        ok: false,
        mensaje: "Error interno.",
      },
      { status: 500 }
    );
  }
}