"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { supabase } from "../../lib/supabase";
import Link from "next/link";

import { enviarEmailsReserva } from "../../lib/enviarEmailsReserva";

export default function ReservarPage() {

  const [publicacion, setPublicacion] =
  useState<any>(null);

  const [usuarioActual, setUsuarioActual] =
  useState("");
  

  const precioDia =
  publicacion?.precio_dia || 0;

  const resguardo =
  Number(publicacion?.resguardo) || 0;

  const [diasSeleccionados, setDiasSeleccionados] = useState<string[]>([]);
  const [fechasDisponibles, setFechasDisponibles] = useState<string[]>([]);
  const [fechasReservadas, setFechasReservadas] = useState<string[]>([]);
  const hoy = new Date();

const mesActual = hoy.getMonth();
const anioActual = hoy.getFullYear();
const diaActual = hoy.getDate();
const params = useParams();
const router = useRouter();
const publicationId = params.id as string;
useEffect(() => {
  cargarPublicacion();
  cargarDisponibilidad();
  cargarUsuarioActual();
}, []);



async function cargarDisponibilidad() {
  const { data } = await supabase
    .from("publication_availability")
    .select("fecha")
    .eq("publication_id", publicationId);

  if (data) {
    setFechasDisponibles(
      data.map((f) => f.fecha)
    );
  }

  const { data: reservas } = await supabase
    .from("reservations")
    .select("fecha")
    .eq("publication_id", publicationId);

  if (reservas) {
    setFechasReservadas(
      reservas.map((r) => r.fecha)
    );
  }
}

async function cargarUsuarioActual() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { data } = await supabase
    .from("profiles")
    .select("nombre")
    .eq("id", user.id)
    .single();

  if (data) {
    setUsuarioActual(data.nombre);
  }
}

const meses = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const [mesSeleccionado, setMesSeleccionado] =
  useState(mesActual);

const [anioSeleccionado, setAnioSeleccionado] =
  useState(anioActual);

const diasMes = new Date(
  anioSeleccionado,
  mesSeleccionado + 1,
  0
).getDate();

const primerDiaSemana = new Date(
  anioSeleccionado,
  mesSeleccionado,
  1
).getDay();

const offset =
  primerDiaSemana === 0
    ? 6
    : primerDiaSemana - 1;



async function cargarPublicacion() {
  const { data, error } = await supabase
    .from("publications")
    .select("*")
    .eq("id", publicationId)
    .single();

  if (!error && data) {
    setPublicacion(data);
  }
}
async function cargarReservas() {
  const { data } = await supabase
    .from("reservations")
    .select("fecha")
    .eq("publication_id", publicationId);

  if (data) {
    setFechasReservadas(
      data.map((r) => r.fecha)
    );
  }
}

function toggleCategoria(
  categoria: string
) {
  setCategorias((prev) =>
    prev.includes(categoria)
      ? prev.filter(
          (c) => c !== categoria
        )
      : [...prev, categoria]
  );
}

  function toggleDia(fechaCompleta: string) {
  if (
    diasSeleccionados.includes(
      fechaCompleta
    )
  ) {
    setDiasSeleccionados(
      diasSeleccionados.filter(
        (f) => f !== fechaCompleta
      )
    );
  } else {
    setDiasSeleccionados([
      ...diasSeleccionados,
      fechaCompleta,
    ]);
  }
}
async function reservar() {
  if (diasSeleccionados.length === 0) {
    alert("Seleccioná al menos un día");
    return;
  }

  const confirmar = confirm(
    `Vas a reservar ${diasSeleccionados.length} día(s).\n\n` +
    `Total: $${total.toLocaleString("es-AR")}\n\n` +
    `El monto de resguardo será reintegrado al finalizar la reserva si el espacio es devuelto en las condiciones acordadas.\n\n` +
    `¿Deseás continuar?`
  );

  if (!confirmar) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    alert("Debes iniciar sesión");
    return;
  }

const operacionId = crypto.randomUUID();

const reservas = diasSeleccionados.map(
  (fecha) => ({
    publication_id: publicationId,
    inquilino_id: user.id,
    fecha,
    estado: "confirmada",
    operacion_id: operacionId,
  })
);

const { data: reservasCreadas, error } = await supabase
  .from("reservations")
  .insert(reservas)
  .select();

if (error) {
  alert(error.message);
  return;
}

  const { error: paymentError } = await supabase
  .from("reservation_payments")
  .insert([
    {
      reservation_id: reservasCreadas[0].id,
      operacion_id: operacionId,
      publication_id: publicationId,
      tenant_id: user.id,
      owner_id: publicacion.owner_id,
      amount: total,
      payment_method: "Mercado Pago",
      status: "Pendiente",
      localiar_fee: comision,
    },
  ]);

if (paymentError) {
  console.error(
    "Error creando pago:",
    paymentError
  );
  return;
}

await enviarEmailsReserva(operacionId);

  alert("Reserva realizada correctamente");

  router.push("/perfil");

  cargarReservas();
}
  const alquiler =
    diasSeleccionados.length * precioDia;

  const comision =
    alquiler * 0.075;

  const total =
    alquiler + comision + resguardo;

  const [categorias, setCategorias] =
  useState<string[]>([]);  

  return (
    <main
      style={{
        background: "#050505",
        minHeight: "100vh",
        color: "white",
        padding: "20px",
        paddingBottom: "120px",
      }}
    >
      <h1
  style={{
    fontSize: "28px",
    fontWeight: "bold",
    marginBottom: "10px",
  }}
>
  {publicacion?.titulo}
</h1>

      <p
  style={{
    color: "#FF7A00",
    marginBottom: "20px",
  }}
>
  $
  {Number(
    publicacion?.precio_dia || 0
  ).toLocaleString("es-AR")}
  {" "}por día
</p>

      <div
        style={{
          background: "#111111",
          borderRadius: "16px",
          padding: "16px",
          marginBottom: "20px",
        }}
      >
        <h2
          style={{
            color: "#FF7A00",
            marginBottom: "15px",
          }}
        >
          Seleccionar días
        </h2>

        <>
  <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  }}
>
  <button
    onClick={() => {
      if (mesSeleccionado === 0) {
        setMesSeleccionado(11);
        setAnioSeleccionado(
          anioSeleccionado - 1
        );
      } else {
        setMesSeleccionado(
          mesSeleccionado - 1
        );
      }
    }}
    style={{
      background: "#FF7A00",
      border: "none",
      color: "white",
      width: "36px",
      height: "36px",
      borderRadius: "8px",
      cursor: "pointer",
    }}
  >
    ◀
  </button>

  <strong>
    {meses[mesSeleccionado]}{" "}
    {anioSeleccionado}
  </strong>

  <button
    onClick={() => {
      if (mesSeleccionado === 11) {
        setMesSeleccionado(0);
        setAnioSeleccionado(
          anioSeleccionado + 1
        );
      } else {
        setMesSeleccionado(
          mesSeleccionado + 1
        );
      }
    }}
    style={{
      background: "#FF7A00",
      border: "none",
      color: "white",
      width: "36px",
      height: "36px",
      borderRadius: "8px",
      cursor: "pointer",
    }}
  >
    ▶
  </button>
</div>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(7,1fr)",
      gap: "6px",
      marginBottom: "10px",
      textAlign: "center",
      color: "#FF7A00",
      fontWeight: "bold",
    }}
  >
    {["L","M","X","J","V","S","D"].map((d) => (
      <div key={d}>{d}</div>
    ))}
  </div>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(7,1fr)",
      gap: "6px",
    }}
  >
    {Array.from({ length: offset }).map((_, i) => (
      <div key={`vacio-${i}`} />
    ))}

    {Array.from(
      { length: diasMes },
      (_, i) => {
        const dia = i + 1;

        const esPasado =
          anioSeleccionado === anioActual &&
          mesSeleccionado === mesActual &&
          dia < diaActual;

        const fechaCompleta =
  `${anioSeleccionado}-${String(
    mesSeleccionado + 1
  ).padStart(2, "0")}-${String(
    dia
  ).padStart(2, "0")}`;

  
  

const reservado =
  fechasReservadas.includes(
    fechaCompleta
  );

const disponible =
  publicacion?.disponibilidad_total
    ? !reservado
    : fechasDisponibles.includes(fechaCompleta) &&
      !reservado;

;

        const seleccionado =
  diasSeleccionados.includes(
    fechaCompleta
  );

        return (
          <button
            key={dia}
            disabled={
              esPasado ||
              reservado ||
              !disponible
            }
            onClick={() =>
              toggleDia(fechaCompleta)
            }
            style={{
              height: "42px",
              border: "none",
              borderRadius: "8px",
              color: "white",
              fontWeight: "bold",
              cursor:
                esPasado ||
                reservado ||
                !disponible
                  ? "not-allowed"
                  : "pointer",

              background:
                esPasado
                  ? "#555"
                  : seleccionado
                  ? "#0066FF"
                  : disponible && !reservado
                  ? "#1FAA59"
                  : "#8B0000",
            }}
          >
            {dia}
          </button>
        );
      }
    )}
  </div>
</>
      </div>

      <div
        style={{
          background: "#111111",
          borderRadius: "16px",
          padding: "16px",
          marginBottom: "20px",
        }}
      >
        <h2
          style={{
            color: "#FF7A00",
            marginBottom: "10px",
          }}
        >
          Días reservados
        </h2>

        {diasSeleccionados.length === 0 ? (
  <p>No seleccionaste días.</p>
) : (
  [...diasSeleccionados]
    .sort()
    .map((fecha) => {
      const [anio, mes, dia] =
        fecha.split("-");

      return (
        <div key={fecha}>
          ✓ {dia}/{mes}/{anio}
        </div>
      );
    })
)}
      </div>

      <div
        style={{
          background: "#111111",
          borderRadius: "16px",
          padding: "16px",
        }}
      >
        <p>
          Cantidad de días:
          {" "}
          <strong>
            {diasSeleccionados.length}
          </strong>
        </p>

        <p>
          Alquiler:
          {" "}
          <strong>
            $
            {alquiler.toLocaleString(
              "es-AR"
            )}
          </strong>
        </p>

        <p>
          Comisión:
          {" "}
          <strong>
            $
            {comision.toLocaleString(
              "es-AR"
            )}
          </strong>
        </p>

        <p>
          Resguardo:
          {" "}
          <strong>
            $
            {resguardo.toLocaleString(
              "es-AR"
            )}
          </strong>
        </p>

        <hr
          style={{
            margin: "15px 0",
          }}
        />

        <h2
          style={{
            color: "#FF7A00",
          }}
        >
          Total: $
          {total.toLocaleString(
            "es-AR"
          )}
        </h2>

        <button
  onClick={reservar}
  style={{
    background: "#FF7A00",
    color: "white",
    border: "none",
    borderRadius: "12px",
    padding: "14px",
    fontWeight: "bold",
    cursor: "pointer",
    width: "100%",
  }}
>
  Reservar
</button>
      </div>
      <footer
  style={{
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    height: "70px",
    background: "#0D1F3D",
    borderTop: "1px solid rgba(255,255,255,0.1)",
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    boxShadow: "0 -4px 12px rgba(0,0,0,0.4)",
    zIndex: 1000,
  }}
>
  <Link
    href="/"
    style={{
      color: "white",
      fontSize: "16px",
      fontWeight: "bold",
      textDecoration: "none",
    }}
  >
    🏠 Home
  </Link>

  <Link
  href="/perfil"
  style={{
    color: "white",
    fontSize: "16px",
    fontWeight: "bold",
    textDecoration: "none",
  }}
>
  👤 {usuarioActual}
</Link>
</footer>
    </main>
  );
}
