"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";



export default function PerfilPage() {
  const [misReservas, setMisReservas] = useState<any[]>([]);
  const [misPublicaciones, setMisPublicaciones] = useState<any[]>([]);
  const [favoritos, setFavoritos] = useState<any[]>([]);
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);
  const [historialPublicaciones, setHistorialPublicaciones] = useState<any[]>([]);
  const [closuresHistorial, setClosuresHistorial] = useState<string[]>([]);

  // NO bloquear render

  useEffect(() => {
  cargarUsuario();
  cargarMisReservas();
  cargarMisPublicaciones();
  cargarFavoritos();
  cargarHistorialPublicaciones();
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

  alert("Reserva cancelada correctamente.");

  await cargarMisReservas();
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

async function cargarMisReservas() {
  setMisReservas([]);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  

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


});
  }

  setMisReservas(resultado);
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
  console.log(data);
}

async function cargarHistorialPublicaciones() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

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

  

  const actionsSet = new Set(
  (actions || [])
    .filter((a: any) => a.action === "ok")
    .map((a: any) => a.operacion_id)
);

const historial = await Promise.all(
  (data || []).map(async (r: any) => {
    const { data: perfil } = await supabase
      .from("profiles")
      .select("nombre")
      .eq("id", r.to_user_id)
      .single();

    return {
  ...r,
  nombreInquilino: perfil?.nombre,
  todoOk: actionsSet.has(r.operacion_id),
};
  })
);

setHistorialPublicaciones(historial);

  
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

  const { data } = await supabase
    .from("profiles")
    .select("id, nombre")
    .eq("id", user.id)
    .single();

  if (data) {
    setUsuario(data);
  }
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

  await cargar();
}
  const [precioDia, setPrecioDia] = useState(0);

  

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

  await cargar();
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

  const resultado = await Promise.all(
    data.map(async (r) => {
      const { data: perfil } = await supabase
        .from("profiles")
        .select("nombre, telefono")
        .eq("id", r.inquilino_id)
        .single();

      const ultimaFecha = r.fecha;

      const reservaFinalizada =
        new Date(ultimaFecha + "T23:59:59") < new Date();

      

      return {
        operacion_id: r.operacion_id,
        publicacion_titulo: publicacion?.titulo,
        fecha: r.fecha,
        nombre: perfil?.nombre,
        telefono: perfil?.telefono,
        precio_dia: Number(publicacion?.precio_dia || 0),
        inquilino_id: r.inquilino_id,
        reservaFinalizada,
        
        confirmedByOwner: false,
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
      {reservas.map((r, i) => {

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
          ⭐ 5.0
        </p>

        <p
          style={{
            color: "#cccccc",
          }}
        >
          0 operaciones
        </p>
      </div>

      
        <div
  style={{
    background: "#111111",
    borderRadius: "16px",
    padding: "20px",
  }}
>
  <h2
    style={{
      color: "#FF7A00",
      marginBottom: "20px",
    }}
  >
    Mis Reservas
  </h2>

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
</div>

<div
  style={{
    background: "#111111",
    borderRadius: "16px",
    padding: "20px",
    marginTop: "20px",
  }}
>
  <h2
    style={{
      color: "#FF7A00",
      marginBottom: "20px",
    }}
  >
    Historial de mis Reservas
  </h2>

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
        }}
      >
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
</div>

        <div
  style={{
    background: "#111111",
    borderRadius: "16px",
    padding: "20px",
    marginTop: "20px",
  }}
>
  <h2
    style={{
      color: "#FF7A00",
      marginBottom: "20px",
    }}
  >
    Mis Publicaciones
  </h2>

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

        <PublicacionReservas
  publicacionId={pub.publication_id}
  precio={pub.precio}
  ownerId={usuario?.id}
/>
      </div>
    ))
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
  <h2
    style={{
      color: "#FF7A00",
      marginBottom: "20px",
    }}
  >
    Historial de mis publicaciones
  </h2>

  {historialPublicaciones.length === 0 ? (
  <p>No tenés valoraciones todavía.</p>
) : (
  <>
    {historialPublicaciones.map((r) => (
      <div
        key={r.id}
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          paddingBottom: "15px",
          marginBottom: "15px",
        }}
      >
        <p>
          Valoraste con{" "}
          <strong>{"★".repeat(r.puntuacion)}</strong> a{" "}
          <strong>{r.nombreInquilino}</strong> por el uso de{" "}
          <strong>{r.publications?.titulo}</strong>
        </p>

        {!r.todoOk && (
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
      </div>
    ))}
  </>
)}



        <div
  style={{
    background: "#111111",
    borderRadius: "16px",
    padding: "20px",
    marginTop: "20px",
  }}
>
  <h2
    style={{
      color: "#FF7A00",
      marginBottom: "20px",
    }}
  >
    Favoritos
  </h2>

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
</div>

        <MenuCard
          icon="💰"
          title="Movimientos"
        />

        <MenuCard
          icon="🔔"
          title="Notificaciones"
        />

        <MenuCard
          icon="⚙️"
          title="Mi Perfil"
        />
      </div>
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
}: {
  icon: string;
  title: string;
}) {
  return (
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
      <span
        style={{
          fontSize: "24px",
        }}
      >
        {icon}
      </span>

      <span
        style={{
          fontWeight: "bold",
        }}
      >
        {title}
      </span>
    </div>
  );
}