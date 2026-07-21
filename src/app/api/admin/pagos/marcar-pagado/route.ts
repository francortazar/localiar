import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { id } = body;
    console.log("ID recibido en API:", id);

    if (!id) {
      return NextResponse.json(
        {
          ok: false,
          mensaje: "No se recibió el ID de la reserva.",
        },
        { status: 400 }
      );
    }

    const { data: prueba, error: errorPrueba } = await supabaseAdmin
  .from("reservations")
  .select("id, estado_pago")
  .eq("operacion_id", id);

console.log("Prueba búsqueda:", prueba);
console.log("Error búsqueda:", errorPrueba);

    const { data, error } = await supabaseAdmin
      .from("reservations")
      .update({
  estado_pago: "pagado",
  fecha_pago_real: new Date().toISOString(),
})
      .eq("operacion_id", id)
      .select("id, estado_pago");

    if (error) {
      console.error("Error actualizando pago:", error);

      return NextResponse.json(
        {
          ok: false,
          mensaje: "No se pudo actualizar el pago.",
        },
        { status: 500 }
      );
    }

    console.log("Resultado Supabase:", data);
console.log("Error Supabase:", error);

return NextResponse.json({
  ok: true,
  mensaje: "Pago marcado como pagado.",
  data,
});
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        ok: false,
        mensaje: "Error interno del servidor.",
      },
      { status: 500 }
    );
  }
}