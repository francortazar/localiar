import { createClient } from "@supabase/supabase-js";
import { sendEmail } from "./sendEmail";
import { reservaPropietario } from "./emailTemplates/reservaPropietario";
import { reservaInquilino } from "./emailTemplates/reservaInquilino";

const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function enviarEmailsReserva(
operacionId: string
) {
const { data: reservas, error } = await supabase
.from("reservations")
.select(`       *,
      publications (
        id,
        titulo,
        precio_dia,
        resguardo,
        alias_pago,
        profiles (
          id,
          nombre,
          email
        )
      ),
      profiles (
        id,
        nombre,
        email
      )
    `)
.eq("operacion_id", operacionId)
.order("fecha", { ascending: true });

if (error) {
console.error(
"ERROR OBTENIENDO RESERVAS PARA EMAILS:",
error
);


throw new Error(
  "No se pudo obtener las reservas."
);


}

if (!reservas || reservas.length === 0) {
throw new Error(
"No existen reservas para esa operación."
);
}

const reserva = reservas[0];

const propietario =
reserva.publications.profiles;

const inquilino =
reserva.profiles;

const publicacion =
reserva.publications;

const fechasReservadas =
reservas.map((r) => r.fecha);

const cantidadDias =
reservas.length;

const montoAlquilerBase =
publicacion.precio_dia *
cantidadDias;

const comision =
montoAlquilerBase * 0.075;

const montoAlquilerInquilino =
montoAlquilerBase + comision;

const montoAlquilerPropietario =
montoAlquilerBase - comision;

const montoResguardo =
publicacion.resguardo;

const totalPagarInquilino =
montoAlquilerInquilino +
montoResguardo;

const totalRecibirPropietario =
montoAlquilerPropietario;

console.log(
"PREPARANDO EMAILS DE RESERVA:",
{
operacionId,
propietario: propietario?.email,
inquilino: inquilino?.email,
titulo: publicacion?.titulo,
fechas: fechasReservadas,
}
);

if (!propietario?.email) {
throw new Error(
"El propietario no tiene email."
);
}

if (!inquilino?.email) {
throw new Error(
"El inquilino no tiene email."
);
}

const htmlPropietario =
reservaPropietario({
nombrePropietario:
propietario.nombre,


  nombreInquilino:
    inquilino.nombre,

  titulo:
    publicacion.titulo,

  urlPublicacion:
    `https://localiar.com/publicacion/${publicacion.id}`,

  fechas:
    fechasReservadas,

  totalAlquiler:
    totalRecibirPropietario,

  resguardo:
    montoResguardo,
});


await sendEmail({
to: propietario.email,
subject:
"Nueva reserva en Localiar",
html: htmlPropietario,
});

console.log(
"EMAIL PROPIETARIO ENVIADO:",
propietario.email
);

const htmlInquilino =
reservaInquilino({
nombreInquilino:
inquilino.nombre,


  nombrePropietario:
    propietario.nombre,

  titulo:
    publicacion.titulo,

  urlPublicacion:
    `https://localiar.com/publicacion/${publicacion.id}`,

  fechas:
    fechasReservadas,

  totalAlquiler:
    montoAlquilerInquilino,

  resguardo:
    montoResguardo,
});


await sendEmail({
to: inquilino.email,
subject:
"Reserva confirmada en Localiar",
html: htmlInquilino,
});

console.log(
"EMAIL INQUILINO ENVIADO:",
inquilino.email
);

console.log({
operacionId,
propietario,
inquilino,
titulo: publicacion.titulo,
fechasReservadas,
cantidadDias,
montoAlquilerBase,
montoAlquilerInquilino,
montoAlquilerPropietario,
montoResguardo,
totalPagarInquilino,
totalRecibirPropietario,
});
}
