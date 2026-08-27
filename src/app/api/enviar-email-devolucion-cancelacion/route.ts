import { NextResponse } from "next/server";
import { enviarEmailDevolucionCancelacion } from "@/app/lib/enviarEmailDevolucionCancelacion";

export async function POST(req: Request) {
  try {
    const { cancelacionId, emailInquilino } =
      await req.json();

    if (!cancelacionId || !emailInquilino) {
      return NextResponse.json(
        {
          error:
            "Faltan datos para enviar el email.",
        },
        { status: 400 }
      );
    }

    await enviarEmailDevolucionCancelacion(
      cancelacionId,
      emailInquilino
    );

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error(
      "Error enviando email de devolución:",
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          "No se pudo enviar el email.",
      },
      { status: 500 }
    );
  }
}