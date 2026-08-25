"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";
import { enviarEmailsCancelacion } from "../lib/enviarEmailsCancelacion";


export default function PerfilPage() {
  const [misReservas, setMisReservas] = useState<any[]>([]);
  const [misPublicaciones, setMisPublicaciones] = useState<any[]>([]);
  const [favoritos, setFavoritos] = useState<any[]>([]);
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);
  const [promedioRating, setPromedioRating] = useState<number>(0);
  const [historialPublicaciones, setHistorialPublicaciones] = useState<any[]>([]);
  const [closuresHistorial, setClosuresHistorial] = useState<string[]>([]);
  const [cantidadOperaciones, setCantidadOperaciones] = useState(0);
  const [notificaciones, setNotificaciones] = useState<any[]>([]);

  const [mostrarReservas, setMostrarReservas] = useState(false);
  const [mostrarHistorialReservas, setMostrarHistorialReservas] = useState(false);
  const [mostrarPublicaciones, setMostrarPublicaciones] = useState(false);
  const [mostrarHistorialPublicaciones, setMostrarHistorialPublicaciones] = useState(false);
  const [mostrarFavoritos, setMostrarFavoritos] = useState(false);
  const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false);
  const [mostrarMovimientos, setMostrarMovimientos] = useState(false);
  const [movimientosIngresos, setMovimientosIngresos] = useState<any[]>([]);


  async function cargarMovimientosIngresos() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  // Pagos de alquiler
  const { data: pagos } = await supabase
    .from("reservation_payments")
    .select(`
      id,
      amount,
      owner_paid_at,
      publications (
        titulo,
        resguardo
      )
    `)
    .eq("owner_id", user.id)
    .eq("owner_payment_status", "pagado");

    console.log("PAGOS DE PROPIETARIO:", pagos);

  const ingresosAlquiler = (pagos || []).map((pago: any) => {
    const totalCobrado = Number(pago.amount || 0);
    const resguardo = Number(pago.publications?.resguardo || 0);

    const alquilerBase = (totalCobrado - resguardo) / 1.075;

    return {
      id: pago.id,
      tipo: "alquiler",
      titulo: pago.publications?.titulo,
      fecha: pago.owner_paid_at,
      importe: alquilerBase * 0.925,
    };
  });

  // Pagos de resguardo
  const { data: reclamos } = await supabase
    .from("owner_claims")
    .select(`
      id,
      paid_at,
      reservations (
        publications (
          titulo,
          resguardo
        )
      )
    `)
    .eq("owner_id", user.id)
    .eq("status", "approved")
    .not("paid_at", "is", null);

  const ingresosResguardo = (reclamos || []).map((r: any) => ({
  id: `claim-${r.id}`,
  tipo: "resguardo",
  titulo: r.reservations?.[0]?.publications?.titulo,
  fecha: r.paid_at,
  importe: Number(
    r.reservations?.[0]?.publications?.resguardo || 0
  ),
}));

  const movimientos = [
    ...ingresosAlquiler,
    ...ingresosResguardo,
  ].sort(
    (a, b) =>
      new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  );

  setMovimientosIngresos(movimientos);
}



  async function recargarPerfil() {
  await Promise.all([
    cargarMisReservas(),
    cargarMisPublicaciones(),
    cargarHistorialPublicaciones(),
  ]);
}

  // NO bloquear render

useEffect(() => {
  cargarUsuario();
  cargarMisReservas();
  cargarMisPublicaciones();
  cargarFavoritos();
  cargarHistorialPublicaciones();
  cargarNotificaciones();
  cargarMovimientosIngresos();


}, []);

async function cargarFavoritos() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { data, error } = await supabase
    .from("favorites")
    .select(`
      publication_id,
      publications (
        id,
        titulo,
        ciudad,
        provincia,
        precio_dia
      )
    `)
    .eq("usuario_id", user.id);

  if (error) {
    console.error(error);
    return;
  }

  setFavoritos(data || []);
}

async function cancelarReserva(
  operacionId: string,
  fechas: string[]
) {
  const primeraFecha = [...fechas]
    .sort()[0];

  const ahora = new Date();

  const fechaInicio = new Date(
    primeraFecha + "T00:00:00"
  );

  const diferenciaHoras =
    (fechaInicio.getTime() -
      ahora.getTime()) /
    (1000 * 60 * 60);

  if (diferenciaHoras < 24) {
    alert(
      "No es posible cancelar una reserva con menos de 24 horas de anticipación."
    );
    return;
  }

  const confirmar = confirm(
    "¿Deseás cancelar esta reserva?\n\nLa comisión de Localiar no será reintegrada."
  );

  if (!confirmar) return;

  const { data: reservasCanceladas, error: errorReservas } =
  await supabase
    .from("reservations")
    .select(`
      *,
      publications (
        owner_id,
        precio_dia,
        resguardo
      )
    `)
    .eq("operacion_id", operacionId);


if (errorReservas || !reservasCanceladas?.length) {
  console.error(errorReservas);
  return;
}


const primeraReserva = reservasCanceladas[0];

const cantidadDias = reservasCanceladas.length;

const precioDia =
  Number(primeraReserva.publications.precio_dia);

const alquiler =
  cantidadDias * precioDia;

const comision =
  alquiler * 0.075;

const montoDevolver = alquiler;


const { error: errorCancelacion } =
  await supabase
    .from("reservation_cancellations")
    .insert({
      operacion_id: operacionId,
      publication_id: primeraReserva.publication_id,
      owner_id: primeraReserva.publications.owner_id,
      inquilino_id: primeraReserva.inquilino_id,
      cancelado_por: "inquilino",
      cantidad_dias: cantidadDias,
      precio_dia: precioDia,
      comision,
      resguardo:
  Number(primeraReserva.publications.resguardo),

monto_devolver: montoDevolver,

devolver_comision: false,

fechas,
    });


if (errorCancelacion) {
  console.error(errorCancelacion);
  alert(errorCancelacion.message);
  return;
}

  console.log(
    "BORRANDO OPERACION:",
    operacionId
  );

  const {
    data,
    error: deleteError,
  } = await supabase
    .from("reservations")
    .delete()
    .eq("operacion_id", operacionId)
    .select();

  console.log("DELETE DATA", data);
  console.log("DELETE ERROR", deleteError);

  if (deleteError) {
  alert(deleteError.message);
  return;
}

// NUEVO:
// enviar mail cancelación inquilino
// enviar mail cancelación propietario

alert("Reserva cancelada correctamente.");

await cargarMisReservas();
await enviarEmailsCancelacion(
  operacionId
);
}

async function valorarReserva(
  operacionId: string,
  publicationId: string,
  puntuacion: number
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { data: publicacion, error: pubError } =
    await supabase
      .from("publications")
      .select("owner_id")
      .eq("id", publicationId)
      .single();

  if (pubError) {
    alert(pubError.message);
    return;
  }

  const { error } = await supabase.from("reviews").insert({
    operacion_id: operacionId,
    publication_id: publicationId,
    usuario_id: user.id,
    from_user_id: user.id,
    to_user_id: null,
    type: "renter_to_publication",
    puntuacion,
  });

  if (error) {
    alert(error.message);
    return;
  }

  alert("Gracias por tu valoración.");
  cargarMisReservas();
}

async function cargarNotificaciones() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { data: leidas, error: errorLeidas } = await supabase
  .from("read_notifications")
  .select("message_id")
  .eq("user_id", user.id);
  const { data: ocultas, error: errorOcultas } = await supabase
  .from("hidden_publication_notifications")
  .select("message_id")
  .eq("user_id", user.id);

if (errorOcultas) {
  console.log(errorOcultas);
  return;
}

const mensajesOcultos = new Set(
  (ocultas || []).map((n) => n.message_id)
);

if (errorLeidas) {
  console.log(errorLeidas);
  return;
}

const mensajesLeidos = new Set(
  (leidas || []).map((n) => n.message_id)
);

  // Traigo los IDs de mis publicaciones
  const { data: publicaciones, error: errorPublicaciones } = await supabase
    .from("publications")
    .select("id")
    .eq("owner_id", user.id);

  if (errorPublicaciones) {
    console.log(errorPublicaciones);
    return;
  }

  const idsPublicaciones = (publicaciones || []).map((p) => p.id);

  console.log("MIS PUBLICACIONES:", idsPublicaciones);

  // Traigo todos los mensajes
  const { data, error } = await supabase
    .from("publication_messages")
    .select("*")
    .order("created_at", { ascending: false });

    console.log("TODOS LOS MENSAJES:", data);

    const preguntas = (data || []).filter(
  (m) => m.tipo === "pregunta"
);

const respuestas = (data || []).filter(
  (m) => m.tipo === "respuesta"
);

console.table(
  respuestas.map((r) => ({
    id: r.id,
    parent_id: r.parent_id,
    publication_id: r.publication_id,
    user_id: r.user_id,
    tipo: r.tipo,
    texto: r.texto,
  }))
);

console.log("PREGUNTAS:", preguntas);

  if (error) {
    console.log(error);
    return;
  }

  // SOLO preguntas hechas en mis publicaciones
  const preguntasEnMisPublicaciones = (data || []).filter(
  (m) =>
    m.tipo === "pregunta" &&
    idsPublicaciones.includes(m.publication_id) &&
    m.user_id !== user.id
);

const respuestasAMisPreguntas = respuestas.filter((respuesta) => {
  const preguntaOriginal = preguntas.find(
    (p) => p.id === respuesta.parent_id
  );

  return preguntaOriginal?.user_id === user.id;
});

const filtradas = [
  ...preguntasEnMisPublicaciones,
  ...respuestasAMisPreguntas,
]
  .filter((n) => !mensajesOcultos.has(n.id))
  .map((n) => ({
    ...n,
    leida: mensajesLeidos.has(n.id),
  }))
  .sort(
    (a, b) =>
      new Date(b.created_at).getTime() -
      new Date(a.created_at).getTime()
  );

  setNotificaciones(filtradas);

  console.log("NOTIFICACIONES FILTRADAS:", filtradas);
}

async function cargarMisReservas() {
  setMisReservas([]);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { data: ocultas } = await supabase
  .from("hidden_notifications")
  .select("review_id")
  .eq("user_id", user.id);

const ocultasSet = new Set(
  (ocultas || []).map((o: any) => o.review_id)
);

  const { data: reservas } = await supabase
    .from("reservations")
    .select("*")
    .eq("inquilino_id", user.id)
    .order("created_at", { ascending: false });

  if (!reservas) return;

  const operaciones: any = {};

  for (const reserva of reservas) {

  if (!reserva.operacion_id) {
    console.log(
      "Reserva sin operacion_id",
      reserva
    );
    continue;
  }
    if (!operaciones[reserva.operacion_id]) {
      operaciones[reserva.operacion_id] = {
        operacion_id: reserva.operacion_id,
        publication_id: reserva.publication_id,
        fechas: [],
      };
    }

    operaciones[reserva.operacion_id].fechas.push(
      reserva.fecha
    );
  }

  const resultado = [];

  for (const operacion of Object.values(
    operaciones
  ) as any[]) {
    const { data: publicacion } = await supabase
      .from("publications")
      .select("*")
      .eq("id", operacion.publication_id)
      .single();

     

    if (!publicacion) continue;

    const { data: anfitrion } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", publicacion.owner_id)
      .single();

    const alquiler =
  operacion.fechas.length *
  Number(publicacion.precio_dia);

const comision =
  alquiler * 0.075;

const ultimaFecha =
  [...operacion.fechas]
    .sort()
    .slice(-1)[0];

const hoy = new Date();

const reservaFinalizada =
  new Date(
    ultimaFecha + "T23:59:59"
  ) < hoy;

const { data: review } =
  await supabase
    .from("reviews")
    .select("id, puntuacion")
    .eq("operacion_id", operacion.operacion_id)
    .eq("type", "renter_to_publication")
    .maybeSingle();

    

resultado.push({
 
  ...operacion,
  publicacion,
  anfitrion,
  montoOperacion:
    alquiler + comision,

  ultimaFecha,
  reservaFinalizada,

  
reviewRealizada: !!review,
puntuacion: review?.puntuacion ?? null,
reviewId: review?.id ?? null,


});
  }

  const resultadoFiltrado = resultado.filter(
  (r: any) => !ocultasSet.has(r.reviewId)
);

setMisReservas(resultadoFiltrado);
}

async function cargarMisPublicaciones() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { data, error } = await supabase.rpc(
    "get_mis_publicaciones",
    {
      owner_uuid: user.id,
    }
  );

  if (error) {
    console.error(error);
    return;
  }

  setMisPublicaciones(data || []);

  const publicacionesConRating = await Promise.all(
  (data || []).map(async (pub: any) => {
    const { data: reviews } = await supabase
      .from("reviews")
      .select("puntuacion")
      .eq("publication_id", pub.publication_id)
      .eq("type", "renter_to_publication");

    const promedio =
      reviews && reviews.length > 0
        ? reviews.reduce((acc, r) => acc + r.puntuacion, 0) /
          reviews.length
        : 0;

    return {
      ...pub,
      promedioRating: promedio,
      cantidadReviews: reviews?.length || 0,
    };
  })
);

setMisPublicaciones(publicacionesConRating);
  console.log(data);
}

async function cargarHistorialPublicaciones() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { data: ocultas } = await supabase
  .from("hidden_notifications")
  .select("review_id")
  .eq("user_id", user.id);

const ocultasSet = new Set(
  (ocultas || []).map((o: any) => o.review_id)
);

  const { data, error } = await supabase
    .from("reviews")
    .select(`
      id,
      operacion_id,
      puntuacion,
      publication_id,
      to_user_id,
      
      publications (
        titulo
      )
    `)
    .eq("from_user_id", user.id)
    .eq("type", "owner_to_renter")
    .order("created_at", { ascending: false });

  if (error) {
  console.log(error);
  alert(JSON.stringify(error));
  return;
}



const { data: actions } = await supabase
  .from("owner_actions")
  .select("operacion_id, action")
  .eq("owner_id", user.id);

const { data: claims } = await supabase
  .from("owner_claims")
  .select("operacion_id, status")
  .eq("owner_id", user.id);

console.log("CLAIMS DEL PROPIETARIO:", claims);

const claimsPendientesSet = new Set(
  (claims || [])
    .filter((c: any) => c.status === "pending")
    .map((c: any) => String(c.operacion_id))
);



  const actionsSet = new Set(
  (actions || []).map((a: any) => String(a.operacion_id))
);

const claimsSet = new Set(
  (claims || []).map((c: any) => String(c.operacion_id))
);

const historial = await Promise.all(
  (data || []).map(async (r: any) => {
    const { data: perfil } = await supabase
      .from("profiles")
      .select("nombre")
      .eq("id", r.to_user_id)
      .single();

    const { data: reservas } = await supabase
  .from("reservations")
  .select("fecha")
  .eq("operacion_id", r.operacion_id)
  .order("fecha", { ascending: false })
  .limit(1);

const fechaFinalizacion =
  reservas && reservas.length > 0
    ? reservas[0].fecha
    : null;

const reclamoRealizado = claimsSet.has(
  String(r.operacion_id)
);

console.log("ESTADO RECLAMO:", {
  operacion_id: r.operacion_id,
  claims,
  reclamoRealizado,
});

return {
  ...r,
  nombreInquilino: perfil?.nombre,
  fechaFinalizacion,
  todoOk: actionsSet.has(r.operacion_id) === true,
  pendiente: claimsPendientesSet.has(String(r.operacion_id)),
  reclamoRealizado,
};
  })
);

const historialFiltrado = historial.filter(
  (r: any) => !ocultasSet.has(r.id)
);

console.log("HISTORIAL IDS:", historial.map((r: any) => r.id));
console.log("OCULTAS IDS:", [...ocultasSet]);

setHistorialPublicaciones(historialFiltrado);

  
}

  async function cerrarSesion() {
  await supabase.auth.signOut();

  router.push("/login");
}
async function cargarUsuario() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  // PERFIL
 const { data } = await supabase
  .from("profiles")
  .select("id, nombre, es_admin")
  .eq("id", user.id)
  .single();

  if (data) {
    setUsuario(data);
    console.log("USUARIO:", data);
  }

  console.log("USUARIO LOGUEADO:", user.id);
console.log("PERFIL ADMIN:", data);

  // RATING COMO INQUILINO (solo este caso)
  const { data: reviews } = await supabase
    .from("reviews")
    .select("puntuacion")
    .eq("to_user_id", user.id)
    .eq("type", "owner_to_renter");

  const promedio =
    reviews && reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.puntuacion, 0) /
        reviews.length
      : 0;

  setPromedioRating(promedio);

  // CANTIDAD DE OPERACIONES (inquilino)
  const { data: reservas } = await supabase
    .from("reservations")
    .select("operacion_id")
    .eq("inquilino_id", user.id);

  setCantidadOperaciones(reservas?.length || 0);
}

const reservasActivas = misReservas.filter(
  (r) => !r.reviewRealizada
);

const historial = misReservas.filter((r) => r.reviewRealizada);

function PublicacionReservas({
  publicacionId,
  precio,
  ownerId,
}: {
  publicacionId: string;
  precio: number;
  ownerId: string;
}) {
  const [reservas, setReservas] = useState<any[]>([]);
  const [closures, setClosures] = useState<any[]>([]);
  if (!ownerId) {
  return <div style={{ color: "#888" }}>Cargando...</div>;
}

  const tieneClosureActivo = (operacionId: string) =>
  closures.some((c) => c.operacion_id === operacionId);

 

  async function valorarInquilinoComoDueno(
  operacionId: string,
publicationId: string,
inquilinoId: string,
puntuacion: number
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { error } = await supabase
  .from("reviews")
  .insert({
  operacion_id: operacionId,

  publication_id: publicationId,

  usuario_id: user.id,

  from_user_id: user.id,
  to_user_id: inquilinoId,

  type: "owner_to_renter",

  puntuacion,
});

  if (error) {
    alert(error.message);
    return;
  }

  alert("Valoración enviada.");

  await recargarPerfil();
}
  const [precioDia, setPrecioDia] = useState(0);
  const reputacionCache = new Map<string, { promedio: number; cantidad: number }>();

  const getReputacionInquilino = async (inquilinoId: string) => {
  const { data: reviews } = await supabase
    .from("reviews")
    .select("puntuacion")
    .eq("to_user_id", inquilinoId)
    .eq("type", "owner_to_renter");

  const safeReviews = reviews ?? [];

  const cantidad = safeReviews.length;

  const promedio =
    cantidad > 0
      ? safeReviews.reduce((acc: number, r: any) => {
          return acc + (r.puntuacion ?? 0);
        }, 0) / cantidad
      : 0;

  return { promedio, cantidad };
};

  

async function handleClosure(
  operacionId: string,
  decision: "ok" | "claim"
) {
  const exists = closures.find(
    (c) => c.operacion_id === operacionId
  );

  if (exists) return;

  const { data: { user } } =
    await supabase.auth.getUser();

  if (!user) return;

  const { error } = await supabase
    .from("operation_closures")
    .insert({
      operacion_id: operacionId,
      owner_id: user.id,
      decision,
      status: "resolved",
      expires_at: new Date(
        Date.now() + 24 * 60 * 60 * 1000
      ).toISOString(),
    });

  if (error) {
    alert(error.message);
    return;
  }

  await recargarPerfil();
  setReservas((prev) =>
  prev.filter((r) => r.operacion_id !== operacionId)
);
}

  useEffect(() => {
  if (!ownerId || !publicacionId) return;
  cargar();
}, [publicacionId, ownerId]);

  async function cancelarReservaComoAnfitrion(
    operacionId: string,
    fecha: string
  ) {
    const confirmar = confirm("¿Cancelar esta fecha de la reserva?");
    if (!confirmar) return;

const { data: reservaCancelada, error: errorReserva } =
  await supabase
    .from("reservations")
    .select(`
      *,
      publications (
        owner_id,
        precio_dia,
        resguardo
      )
    `)
    .eq("operacion_id", operacionId)
    .eq("fecha", fecha)
    .single();


if (errorReserva || !reservaCancelada) {
  console.error(errorReserva);
  alert("No se encontró la reserva.");
  return;
}

const { count: reservasRestantes } = await supabase
  .from("reservations")
  .select("*", {
    count: "exact",
    head: true,
  })
  .eq("operacion_id", operacionId);

const esUltimaFecha =
  reservasRestantes === 1;

const precioDia =
  Number(reservaCancelada.publications.precio_dia);


const alquiler = precioDia;

const comision =
  alquiler * 0.075;

const resguardo = esUltimaFecha
  ? Number(reservaCancelada.publications.resguardo)
  : 0;

const montoDevolver =
  alquiler + comision + resguardo;


const { error: errorCancelacion } =
  await supabase
    .from("reservation_cancellations")
    .insert({
      operacion_id: operacionId,
      publication_id: reservaCancelada.publication_id,
      owner_id: reservaCancelada.publications.owner_id,
      inquilino_id: reservaCancelada.inquilino_id,
      cancelado_por: "propietario",
      cantidad_dias: 1,
      precio_dia: precioDia,
      comision,
      resguardo,
      devolver_comision: true,
      fechas: [fecha],
      monto_devolver: montoDevolver,
    });


if (errorCancelacion) {
  console.error(errorCancelacion);
  alert(errorCancelacion.message);
  return;
}

    const { error } = await supabase
      .from("reservations")
      .delete()
      .eq("operacion_id", operacionId)
      .eq("fecha", fecha);

    if (error) {
      alert(error.message);
      return;
    }

    await cargar();

await enviarEmailsCancelacion(
  operacionId
);

alert("Fecha cancelada correctamente.");
  }

  async function cargar() {
    
  console.log("OWNER ID:", ownerId);

  if (!ownerId || !publicacionId) return;
  if (!ownerId) return;

  const { data } = await supabase
    .from("reservations")
    .select("*")
    .eq("publication_id", publicacionId)
    .neq("estado", "cancelada");

  console.log("RESERVAS ENCONTRADAS:", data);

  const { data: publicacion } = await supabase
  .from("publications")
  .select("precio_dia, titulo")
  .eq("id", publicacionId)
  .single();

  const { data: closuresData } = await supabase
    .from("operation_closures")
    .select("*")
    .eq("owner_id", ownerId)
    .gte("expires_at", new Date().toISOString());

    const closuresSet = new Set(
  (closuresData || []).map((c: any) => c.operacion_id)
);

  setClosures(closuresData || []);

  if (!data) return;

  setPrecioDia(Number(publicacion?.precio_dia || 0));
  const reputacionCache = new Map();
  const resultado = await Promise.all(
    data.map(async (r) => {

      let rep = reputacionCache.get(r.inquilino_id);

if (!rep) {
  const nuevaRep = await getReputacionInquilino(r.inquilino_id);
  rep = {
    promedio: nuevaRep.promedio,
    cantidad: nuevaRep.cantidad,
  };
  reputacionCache.set(r.inquilino_id, rep);
}

const promedioInquilino = rep.promedio;
const cantidadOperacionesInquilino = rep.cantidad;

      const { data: perfil } = await supabase
        .from("profiles")
        .select("nombre, telefono")
        .eq("id", r.inquilino_id)
        .single();

      const ultimaFecha = r.fecha;

      const reservaFinalizada =
        new Date(ultimaFecha + "T23:59:59") < new Date();

      const { data: review } = await supabase
  .from("reviews")
  .select("id")
  .eq("operacion_id", r.operacion_id)
  .eq("type", "owner_to_renter")
  .maybeSingle();

      return {
        promedioInquilino,
        cantidadOperacionesInquilino,
        operacion_id: r.operacion_id,
        publicacion_titulo: publicacion?.titulo,
        fecha: r.fecha,
        nombre: perfil?.nombre,
        telefono: perfil?.telefono,
        precio_dia: Number(publicacion?.precio_dia || 0),
        inquilino_id: r.inquilino_id,
        reservaFinalizada,
        
        reviewOwnerRealizada: !!review,
      };
    })
  );

  const agrupadas: any = {};

  resultado.forEach((r) => {
    if (!agrupadas[r.operacion_id]) {
      agrupadas[r.operacion_id] = {
  operacion_id: r.operacion_id,
  nombre: r.nombre,
  telefono: r.telefono,
  precio_dia: r.precio_dia,
  inquilino_id: r.inquilino_id,
  reservaFinalizada: r.reservaFinalizada,
  reviewOwnerRealizada: r.reviewOwnerRealizada,

  // 👇 ESTO ES LO QUE FALTABA
  promedioInquilino: r.promedioInquilino,
  cantidadOperacionesInquilino: r.cantidadOperacionesInquilino,

  fechas: [],
};
    }

    agrupadas[r.operacion_id].fechas.push(r.fecha);
  });

  const final = Object.values(agrupadas) as any[];

setReservas(final);

}

  if (!reservas.length) return null;

  return (
    <div style={{ marginTop: "10px" }}>
      {reservas
  .filter((r) => !r.reviewOwnerRealizada)
  .map((r, i) => {

        const cantidadDias = r.fechas.length;

const totalCobro =
  cantidadDias * Number(r.precio_dia) * 0.925;

const ultimaFecha = [...r.fechas]
  .sort()
  .at(-1)!;

const fechaPago = new Date(ultimaFecha);
fechaPago.setDate(fechaPago.getDate() + 2);

const fechaCobro =
  fechaPago.toLocaleDateString("es-AR");
        console.log({
  operacion: r.operacion_id,
  reservaFinalizada: r.reservaFinalizada,
  reviewRealizada: r.reviewRealizada,
});
console.log("CHECK BOTÓN:", {
    operacion: r.operacion_id,
    reservaFinalizada: r.reservaFinalizada,
    reviewOwnerRealizada: r.reviewOwnerRealizada,
    closures: closures?.map(c => c.operacion_id),
  });

        return (
          <div
  key={i}
  style={{
    fontSize: "14px",
    color: "#ccc",
    marginTop: "10px",
    paddingBottom: "10px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  }}
>
            {" "}
            <strong style={{ color: "white" }}>
  {r.nombre || "Sin nombre"}
</strong>

{" "}— 📞 {r.telefono || "Sin teléfono"}

<div style={{ marginTop: "4px", color: "#FF7A00", fontSize: "13px" }}>
  ⭐ {(r.promedioInquilino ?? 0).toFixed(1)} · {r.cantidadOperacionesInquilino ?? 0} ops
</div>

<div style={{ marginTop: "10px" }}>
  {r.fechas.map((fecha: string) => {
    const [anio, mes, dia] = fecha.split("-");

    const hoy = new Date();
const fechaObj = new Date(fecha + "T23:59:59");
const yaPaso = fechaObj < hoy;

const cantidadDias = r.fechas.length;

const totalCobro =
  cantidadDias * Number(r.precio_dia) * 0.925;

  

const ultimaFecha = [...r.fechas]
  .sort()
  .at(-1)!;

  const reservaFinalizada =
  new Date(ultimaFecha + "T23:59:59") < new Date();

  

console.log({
  operacion: r.operacion_id,
  ultimaFecha,
  reservaFinalizada,
});

const fechaPago = new Date(ultimaFecha);
fechaPago.setDate(fechaPago.getDate() + 2);

const fechaCobro = fechaPago.toLocaleDateString("es-AR");

    return (
      <div
        key={fecha}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "6px",
        }}
      >
        <span>
          📅 {dia}/{mes}/{anio}
        </span>

        {!yaPaso && (
  <button
    onClick={() =>
      cancelarReservaComoAnfitrion(
        r.operacion_id,
        fecha
      )
    }
    style={{
      background: "#8B0000",
      color: "white",
      border: "none",
      borderRadius: "8px",
      padding: "4px 10px",
      cursor: "pointer",
      fontSize: "12px",
    }}
  >
    Cancelar fecha
  </button>
)}
      </div>
    );
  })}

<div
  style={{
    marginTop: "12px",
    padding: "12px",
    background: "#1b1b1b",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.08)",
  }}
>
  <div>
    💰 <strong>Total a cobrar:</strong>{" "}
    ${totalCobro.toLocaleString("es-AR", {
      maximumFractionDigits: 0,
    })}
  </div>

  <div style={{ marginTop: "6px" }}>
    📅 <strong>Fecha estimada de cobro:</strong>{" "}
    {fechaCobro}
  </div>
</div>



{r.reservaFinalizada && !r.reviewOwnerRealizada && (
  <div style={{ marginTop: "15px" }}>
    <p>
      <strong>Valorá al inquilino</strong>
    </p>

    <div
      style={{
        display: "flex",
        gap: "8px",
        fontSize: "28px",
      }}
    >
      {[1, 2, 3, 4, 5].map((estrella) => (
        <span
          key={estrella}
          style={{ cursor: "pointer" }}
          onClick={() =>
            valorarInquilinoComoDueno(
  r.operacion_id,
  publicacionId,
  r.inquilino_id,
  estrella
)
          }
        >
          ☆
        </span>
      ))}
    </div>
  </div>
)}

</div>
</div>
        );
      })}
    </div>
  );
}

 
    return (
  <main
    style={{
        background: "#050505",
        minHeight: "100vh",
        color: "white",
        padding: "20px",
        paddingBottom: "100px",
      }}
    >
      <div
        style={{
          textAlign: "center",
          marginBottom: "30px",
        }}
      >
        <div
          style={{
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            background: "#0D1F3D",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "40px",
          }}
        >
          👤
        </div>

        <h1
  style={{
    marginTop: "15px",
    fontSize: "28px",
  }}
>
  {usuario?.nombre || "Usuario"}
</h1>

        <p
  style={{
    color: "#FF7A00",
  }}
>
  ⭐ {promedioRating.toFixed(1)} · {cantidadOperaciones} operaciones
</p>
      </div>

      
        <div
  style={{
    background: "#111111",
    borderRadius: "16px",
    padding: "20px",
  }}
>
  <div
  onClick={() => setMostrarReservas(!mostrarReservas)}
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
    marginBottom: mostrarReservas ? "20px" : "0",
  }}
>
  <h2
    style={{
      color: "#FF7A00",
      margin: 0,
    }}
  >
    Mis Reservas
  </h2>

  <span
    style={{
      color: "#FF7A00",
      fontSize: "18px",
      transform: mostrarReservas
        ? "rotate(90deg)"
        : "rotate(0deg)",
      transition: "0.2s",
    }}
  >
    ▶
  </span>
</div>



  {mostrarReservas && (
  <>
    {reservasActivas.length === 0 ? (
    <p>No tenés reservas todavía.</p>
  ) : (
    reservasActivas.map((reserva) => (
      <div
  key={reserva.operacion_id}
  style={{
    borderBottom:
      "1px solid rgba(255,255,255,0.1)",
    paddingBottom: "20px",
    marginBottom: "20px",
    position: "relative",
  }}
>

  

        <Link
          href={`/publicacion/${reserva.publicacion.id}`}
          style={{
            color: "#FF7A00",
            fontWeight: "bold",
            fontSize: "18px",
            textDecoration: "none",
          }}
        >
          {reserva.publicacion.titulo}
        </Link>

        <p>
          <strong>Anfitrión:</strong>{" "}
          {reserva.anfitrion?.nombre}
        </p>

        <p>
          <strong>Teléfono:</strong>{" "}
          {reserva.anfitrion?.telefono}
        </p>

        <p>
          <strong>Email:</strong>{" "}
          {reserva.anfitrion?.email}
        </p>

        <div
          style={{
            marginTop: "10px",
          }}
        >
          <strong>
            Fechas reservadas:
          </strong>

          {reserva.fechas
  .sort()
  .map((fecha: string) => {
    const [anio, mes, dia] =
      fecha.split("-");

    return (
      <div key={fecha}>
        • {dia}/{mes}/{anio}
      </div>
    );
  })}
        </div>

        <p
          style={{
            marginTop: "10px",
          }}
        >
          <strong>
            Monto de operación:
          </strong>{" "}
          $
          {reserva.montoOperacion.toLocaleString(
            "es-AR"
          )}
        </p>

        <p>
          <strong>
            Monto de resguardo:
          </strong>{" "}
          $
          {Number(
            reserva.publicacion.resguardo
          ).toLocaleString("es-AR")}
        </p>

        {!reserva.reservaFinalizada && (
  <button
    onClick={() =>
      cancelarReserva(
        reserva.operacion_id,
        reserva.fechas
      )
    }
    style={{
      marginTop: "15px",
      background: "#8B0000",
      color: "white",
      border: "none",
      borderRadius: "12px",
      padding: "12px",
      cursor: "pointer",
      fontWeight: "bold",
    }}
  >
    Cancelar reserva
  </button>
)}

{reserva.reservaFinalizada &&
 !reserva.reviewRealizada && (
  <div
    style={{
      marginTop: "20px",
    }}
  >
    <p>
      <strong>
        Valorá este espacio
      </strong>
    </p>

    <div
      style={{
        display: "flex",
        gap: "8px",
        fontSize: "28px",
        cursor: "pointer",
      }}
    >
      {[1,2,3,4,5].map(
        (estrella) => (
          <span
            key={estrella}
            onClick={() =>
              valorarReserva(
                reserva.operacion_id,
                reserva.publicacion.id,
                estrella
              )
            }
          >
            ☆
          </span>
        )
      )}
    </div>
  </div>
)}

{reserva.reviewRealizada && (
  <div
    style={{
      marginTop: "15px",
    }}
  >
    <strong>
      Tu valoración:
    </strong>{" "}
    {"★".repeat(
      reserva.puntuacion
    )}
  </div>
)}
      </div>
        ))
  )}
  </>
)}
</div>

<div
  style={{
    background: "#111111",
    borderRadius: "16px",
    padding: "20px",
    marginTop: "20px",
  }}
>
  <div
  onClick={() =>
    setMostrarHistorialReservas(!mostrarHistorialReservas)
  }
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
    marginBottom: mostrarHistorialReservas ? "20px" : "0",
  }}
>
  <h2
    style={{
      color: "#FF7A00",
      margin: 0,
    }}
  >
    Historial de mis Reservas
  </h2>

  <span
    style={{
      color: "#FF7A00",
      fontSize: "18px",
      transform: mostrarHistorialReservas
        ? "rotate(90deg)"
        : "rotate(0deg)",
      transition: "0.2s",
    }}
  >
    ▶
  </span>
</div>

  {mostrarHistorialReservas && (
  <>
    {historial.length === 0 ? (
    <p>No tenés operaciones finalizadas.</p>
  ) : (
    historial
  .filter(r => r.reviewRealizada || r.reviewOwnerRealizada)
  .map((reserva) => (
      <div
  key={reserva.operacion_id}
  style={{
    borderBottom:
      "1px solid rgba(255,255,255,0.1)",
    paddingBottom: "20px",
    marginBottom: "20px",
    position: "relative",
  }}
>

  <button
  onClick={async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
      .from("hidden_notifications")
      .insert({
        user_id: user.id,
        review_id: reserva.reviewId,
      });

    if (error) {
      alert(error.message);
      return;
    }

   setMisReservas((prev) =>
  prev.filter(
    (r) => r.operacion_id !== reserva.operacion_id
  )
);

cargarMisReservas();
  }}
  style={{
    position: "absolute",
    top: "10px",
    right: "10px",
    background: "transparent",
    border: "none",
    color: "#888",
    cursor: "pointer",
    fontSize: "18px",
    fontWeight: "bold",
  }}
>
  ✕
</button>

        <Link
          href={`/publicacion/${reserva.publicacion.id}`}
          style={{
            color: "#FF7A00",
            fontWeight: "bold",
            textDecoration: "none",
          }}
        >
          {reserva.publicacion.titulo}
        </Link>

        <div
  style={{
    marginTop: "10px",
    marginBottom: "10px",
  }}
>
  <strong>
    Fechas utilizadas:
  </strong>

  

  {reserva.fechas
    .sort()
    .map((fecha: string) => {
      const [anio, mes, dia] =
        fecha.split("-");

      return (
        <div key={fecha}>
          • {dia}/{mes}/{anio}
        </div>
      );
    })}
</div>

        <p>
          Valoración:{" "}
          {"★".repeat(reserva.puntuacion)}
        </p>

        <p>
          Monto de operación: $
          {reserva.montoOperacion.toLocaleString(
            "es-AR"
          )}
        </p>
      </div>
        ))
  )}
  </>
)}
</div>

        <div
  style={{
    background: "#111111",
    borderRadius: "16px",
    padding: "20px",
    marginTop: "20px",
  }}
>
 <div
  onClick={() =>
    setMostrarPublicaciones(!mostrarPublicaciones)
  }
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
    marginBottom: mostrarPublicaciones ? "20px" : "0",
  }}
>
  <h2
    style={{
      color: "#FF7A00",
      margin: 0,
    }}
  >
    Mis Publicaciones
  </h2>

  <span
    style={{
      color: "#FF7A00",
      fontSize: "18px",
      transform: mostrarPublicaciones
        ? "rotate(90deg)"
        : "rotate(0deg)",
      transition: "0.2s",
    }}
  >
    ▶
  </span>
</div>

  {mostrarPublicaciones && (
  <>
    {misPublicaciones.length === 0 ? (
    <p>No tenés publicaciones activas.</p>
  ) : (
    misPublicaciones.map((pub) => (
      <div
        key={pub.publication_id}
        style={{
          borderBottom:
            "1px solid rgba(255,255,255,0.1)",
          paddingBottom: "15px",
          marginBottom: "15px",
        }}
      >
        {/* TITULO CLICKABLE */}
        <Link
          href={`/publicacion/${pub.publication_id}`}
          style={{
            color: "#FF7A00",
            fontWeight: "bold",
            fontSize: "18px",
            textDecoration: "none",
          }}
        >
          {pub.titulo}
        </Link>

        <p style={{ color: "#FF7A00", marginTop: "6px" }}>
  ⭐ {(pub.promedioRating ?? 0).toFixed(1)} · {pub.cantidadReviews ?? 0} valoraciones
</p>

        <PublicacionReservas
  publicacionId={pub.publication_id}
  precio={pub.precio}
  ownerId={usuario?.id}
/>
      </div>
    ))
  )}
  </>
)}
</div>

<div
  style={{
    background: "#111111",
    borderRadius: "16px",
    padding: "20px",
    marginTop: "20px",
  }}
>
  <div
  onClick={() =>
    setMostrarHistorialPublicaciones(
      !mostrarHistorialPublicaciones
    )
  }
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
    marginBottom: mostrarHistorialPublicaciones
      ? "20px"
      : "0",
  }}
>
  <h2
    style={{
      color: "#FF7A00",
      margin: 0,
    }}
  >
    Historial de mis publicaciones
  </h2>

  <span
    style={{
      color: "#FF7A00",
      fontSize: "18px",
      transform: mostrarHistorialPublicaciones
        ? "rotate(90deg)"
        : "rotate(0deg)",
      transition: "0.2s",
    }}
  >
    ▶
  </span>
</div>

  {mostrarHistorialPublicaciones && (
  <>
    {historialPublicaciones.length === 0 ? (
  <p>No tenés valoraciones todavía.</p>
) : (
  
    historialPublicaciones.map((r) => (

      
      <div
  key={r.id}
  style={{
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    paddingBottom: "15px",
    marginBottom: "15px",
    position: "relative",
  }}
>

  
  <button
    onClick={async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("hidden_notifications")
        .insert({
          user_id: user.id,
          review_id: r.id,
        });

      if (error) {
        alert(error.message);
        return;
      }

      setHistorialPublicaciones((prev) =>
        prev.filter((item) => item.id !== r.id)
      );
    }}
    style={{
      position: "absolute",
      top: "10px",
      right: "10px",
      background: "transparent",
      border: "none",
      color: "#888",
      cursor: "pointer",
      fontSize: "18px",
      fontWeight: "bold",
    }}
  >
    ✕
  </button>


        <p>
          Valoraste con{" "}
          <strong>{"★".repeat(r.puntuacion)}</strong> a{" "}
          <strong>{r.nombreInquilino}</strong> por el uso de{" "}
          <strong>{r.publications?.titulo}</strong>
        </p>

        {r.fechaFinalizacion && (
  <p
    style={{
      marginTop: "6px",
      color: "#bbbbbb",
      fontSize: "14px",
    }}
  >
    📅 Finalizó la reserva el{" "}
    {(() => {
      const [anio, mes, dia] =
        r.fechaFinalizacion.split("-");
      return `${dia}/${mes}/${anio}`;
    })()}
  </p>
)}

        {!r.todoOk && !r.pendiente && !r.reclamoRealizado && (
          <div
            style={{
              display: "flex",
              gap: "10px",
              marginTop: "15px",
            }}
          >
            <button
              onClick={async () => {
                const {
                  data: { user },
                } = await supabase.auth.getUser();

                if (!user) return;

                const { error } = await supabase
                  .from("owner_actions")
                  .insert({
                    operacion_id: r.operacion_id,
                    owner_id: user.id,
                    action: "ok",
                  });

                if (error) {
                  console.log(error);
                  return;
                }

                setHistorialPublicaciones((prev) =>
  prev.map((item) =>
    item.operacion_id === r.operacion_id
      ? { ...item, todoOk: true }
      : item
  )
);
              }}
              style={{
                flex: 1,
                background: "#198754",
                color: "white",
                border: "none",
                borderRadius: "10px",
                padding: "10px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Todo OK
            </button>

            <button
  onClick={() =>
    router.push(`/perfil/resguardo/${r.operacion_id}`)
  }
  style={{
    flex: 1,
    background: "#C62828",
    color: "white",
    border: "none",
    borderRadius: "10px",
    padding: "10px",
    cursor: "pointer",
    fontWeight: "bold",
  }}
>
  Cobrar monto de resguardo
</button>
          </div>
        )}

        {r.pendiente && (
  <div
    style={{
      marginTop: "15px",
      padding: "10px",
      borderRadius: "10px",
      background: "#FFB300",
      color: "#000",
      textAlign: "center",
      fontWeight: "bold",
    }}
  >
    Pendiente
  </div>
)}
 </div>
        ))
    )}
  </>
)}
</div>




        <div
  style={{
    background: "#111111",
    borderRadius: "16px",
    padding: "20px",
    marginTop: "20px",
  }}
>
  <div
  onClick={() =>
    setMostrarFavoritos(!mostrarFavoritos)
  }
  style={{
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  cursor: "pointer",
  marginBottom: mostrarFavoritos ? "20px" : "0",
}}
>
  <h2
    style={{
      color: "#FF7A00",
      margin: 0,
    }}
  >
    Favoritos
  </h2>

  <span
    style={{
      color: "#FF7A00",
      fontSize: "18px",
      transform: mostrarFavoritos
        ? "rotate(90deg)"
        : "rotate(0deg)",
      transition: "0.2s",
    }}
  >
    ▶
  </span>
</div>



  {mostrarFavoritos && (
  <>
    {favoritos.length === 0 ? (
    <p>No tenés favoritos guardados.</p>
  ) : (
    favoritos.map((fav: any) => (
      <div
        key={fav.publication_id}
        style={{
          borderBottom:
            "1px solid rgba(255,255,255,0.1)",
          paddingBottom: "15px",
          marginBottom: "15px",
        }}
      >
        <Link
          href={`/publicacion/${fav.publications.id}`}
          style={{
            color: "#FF7A00",
            fontWeight: "bold",
            textDecoration: "none",
          }}
        >
          {fav.publications.titulo}
        </Link>

        <div style={{ marginTop: "6px" }}>
          📍 {fav.publications.ciudad},{" "}
          {fav.publications.provincia}
        </div>

        <div style={{ marginTop: "6px" }}>
          💰 $
          {Number(
            fav.publications.precio_dia
          ).toLocaleString("es-AR")}
          {" "}por día
        </div>
      </div>
        ))
  )}
  </>
)}
</div>

<div
  style={{
    background: "#111111",
    borderRadius: "16px",
    padding: "20px",
    marginTop: "20px",
  }}
>
  <div
    onClick={() =>
      setMostrarNotificaciones(!mostrarNotificaciones)
    }
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      cursor: "pointer",
      marginBottom: mostrarNotificaciones ? "20px" : "0",
    }}
  >
    <h2
      style={{
        color: "#FF7A00",
        margin: 0,
      }}
    >
      Notificaciones
    </h2>

    <span
      style={{
        color: "#FF7A00",
        fontSize: "18px",
        transform: mostrarNotificaciones
          ? "rotate(90deg)"
          : "rotate(0deg)",
        transition: "0.2s",
      }}
    >
      ▶
    </span>
  </div>

  {mostrarNotificaciones && (
    <>
      {notificaciones.length === 0 ? (
    <p>No tenés notificaciones.</p>
  ) : (
    notificaciones.map((n: any) => (
      
      <div
  key={n.id}
  style={{
    position: "relative",
  }}
>
  <button
  onClick={async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
      .from("hidden_publication_notifications")
      .insert({
        user_id: user.id,
        message_id: n.id,
      });

    if (error) {
      console.log(error);
      return;
    }

    setNotificaciones((prev) =>
      prev.filter((item) => item.id !== n.id)
    );
  }}
  style={{
    position: "absolute",
    top: "10px",
    right: "10px",
    border: "none",
    background: "transparent",
    color: "#FFFFFF",
    cursor: "pointer",
    fontSize: "18px",
    fontWeight: "bold",
    zIndex: 2,
  }}
>
  ✕
</button>
      <Link
  href={`/publicacion/${n.publication_id}`}
  onClick={async () => {
    await supabase
      .from("read_notifications")
      .insert({
        user_id: usuario.id,
        message_id: n.id,
      });
  }}
  style={{
  display: "block",
  borderBottom: "1px solid rgba(255,255,255,0.1)",
  marginBottom: "12px",
  textDecoration: "none",
  color: n.leida ? "white" : "black",
  cursor: "pointer",
  background: n.leida ? "transparent" : "#FF7A00",
  borderRadius: "10px",
  padding: "12px",
}}
>
        <p>
          <strong>{n.tipo}</strong>
        </p>

        <p>{n.texto}</p>

        <p style={{ color: "#999", fontSize: "13px" }}>
          {n.nombre_usuario}
        </p>

        <p style={{ color: "#777", fontSize: "12px" }}>
  {new Date(n.created_at).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })}
</p>
      </Link>
</div>
        ))
  )}
    </>
  )}
</div>

        <div
  style={{
    background: "#111111",
    borderRadius: "16px",
    padding: "20px",
    marginTop: "20px",
  }}
>
  <div
    onClick={() =>
      setMostrarMovimientos(!mostrarMovimientos)
    }
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      cursor: "pointer",
      marginBottom: mostrarMovimientos ? "20px" : "0",
    }}
  >
    <h2
      style={{
        color: "#FF7A00",
        margin: 0,
      }}
    >
      Movimientos de Capital
    </h2>

    <span
      style={{
        color: "#FF7A00",
        fontSize: "18px",
        transform: mostrarMovimientos
          ? "rotate(90deg)"
          : "rotate(0deg)",
        transition: "0.2s",
      }}
    >
      ▶
    </span>
  </div>

  {mostrarMovimientos && (
    <>
      <div style={{ marginBottom: "30px" }}>
  <h3
    style={{
      color: "#198754",
      marginBottom: "15px",
    }}
  >
    Ingresos
  </h3>

  {movimientosIngresos.length === 0 ? (
    <p style={{ color: "#888" }}>
      Todavía no hay ingresos registrados.
    </p>
  ) : (
    <>
      <div
        style={{
          background: "#16351F",
          borderRadius: "12px",
          padding: "15px",
          marginBottom: "15px",
        }}
      >
        <div
          style={{
            color: "#999",
            fontSize: "13px",
          }}
        >
          Total cobrado
        </div>

        <div
          style={{
            color: "#4ADE80",
            fontSize: "26px",
            fontWeight: "bold",
            marginTop: "4px",
          }}
        >
          $
          {movimientosIngresos
            .reduce(
              (total, movimiento) =>
                total +
                Number(
                  movimiento.importe || 0
                ),
              0
            )
            .toLocaleString("es-AR", {
              maximumFractionDigits: 0,
            })}
        </div>
      </div>

      {movimientosIngresos.map((movimiento) => (
        
        
        <div
          key={movimiento.id}

          
          style={{
            borderBottom:
              "1px solid rgba(255,255,255,0.1)",
            paddingBottom: "15px",
            marginBottom: "15px",
          }}
        >

         
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "15px",
            }}
          >
            <div>
  <div
  style={{
    color: "#FFFFFF",
    fontWeight: "bold",
  }}
>
  {movimiento.tipo === "resguardo"
    ? "🛡️ " + (movimiento.titulo || "Reserva")
    : "🏠 " + (movimiento.titulo || "Reserva")}
</div>

<div
  style={{
    color: "#AAAAAA",
    fontSize: "13px",
    marginTop: "4px",
  }}
>
  {movimiento.tipo === "resguardo"
    ? "Pago de resguardo"
    : "Pago de alquiler"}
</div>

  {movimiento.fecha && (
    <div
      style={{
        color: "#999",
        fontSize: "13px",
        marginTop: "6px",
      }}
    >
      📅 Pago realizado:{" "}
      {new Date(
        movimiento.fecha
      ).toLocaleDateString("es-AR")}
    </div>
  )}
</div>

            <div
              style={{
                color: "#4ADE80",
                fontWeight: "bold",
                whiteSpace: "nowrap",
              }}
            >
              + $
              {Number(
                movimiento.importe || 0
              ).toLocaleString("es-AR", {
                maximumFractionDigits: 0,
              })}
            </div>
          </div>
        </div>
      ))}
    </>
  )}
</div>

      
    </>
  )}
</div>

        

        <MenuCard
  icon="⚙️"
  title="Editar perfil"
  href="/perfil/editar"
/>


{usuario?.es_admin && (
  <MenuCard
  icon="🛡️"
  title="Panel de Administración"
  href="/admin"
/>
)}

      



      <button
  onClick={cerrarSesion}
  style={{
    marginTop: "20px",
    background: "#FF7A00",
    color: "white",
    border: "none",
    borderRadius: "16px",
    padding: "18px",
    fontWeight: "bold",
    cursor: "pointer",
  }}
>
  Cerrar sesión
</button>

      <footer
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: "70px",
          background: "#0D1F3D",
          borderTop:
            "1px solid rgba(255,255,255,0.1)",
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          boxShadow:
            "0 -4px 12px rgba(0,0,0,0.4)",
        }}
      >
        <Link
          href="/"
          style={{
            color: "white",
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          🏠 Home
        </Link>

        <Link
  href="/publicar"
  style={{
    color: "#FF7A00",
    textDecoration: "none",
    fontWeight: "bold",
  }}
>
  ➕ Publicar
</Link>
      </footer>
    </main>
  );
}

function MenuCard({
  icon,
  title,
  href,
}: {
  icon: string;
  title: string;
  href?: string;
}) {
  return href ? (
  <Link
    href={href}
    style={{ textDecoration: "none", color: "inherit" }}
  >
    <div
      style={{
        background: "#111111",
        borderRadius: "16px",
        padding: "18px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        cursor: "pointer",
        boxShadow:
          "0 4px 15px rgba(0,0,0,0.5)",
      }}
    >
      <span style={{ fontSize: "24px" }}>
        {icon}
      </span>

      <span style={{ fontWeight: "bold" }}>
        {title}
      </span>
    </div>
  </Link>
) : (
  <div
    style={{
      background: "#111111",
      borderRadius: "16px",
      padding: "18px",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      cursor: "pointer",
      boxShadow:
        "0 4px 15px rgba(0,0,0,0.5)",
    }}
  >
    <span style={{ fontSize: "24px" }}>
      {icon}
    </span>

    <span style={{ fontWeight: "bold" }}>
      {title}
    </span>
  </div>
);
}