"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import UsuariosTable from "./components/UsuariosTable";


export default function UsuariosPage() {

    const [usuarios, setUsuarios] = useState<any[]>([]);
    const [filtroNombre, setFiltroNombre] = useState("");
    const [filtroProvincia, setFiltroProvincia] = useState("");
    const [filtroTelefono, setFiltroTelefono] = useState("");
    const [filtroEmail, setFiltroEmail] = useState("");
    const [filtroRol, setFiltroRol] = useState("");
    const [ordenRegistro, setOrdenRegistro] = useState("nuevos");

useEffect(() => {
  async function cargarUsuarios() {
    const { data, error } = await supabase
      .from("profiles")
      .select(`
  id,
  nombre,
  telefono,
  email,
  provincia,
  created_at,
  es_admin
`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error cargando usuarios:", error);
      return;
    }

const { data: valoraciones, error: errorValoraciones } = await supabase
  .from("reviews")
  .select(`
    to_user_id,
    puntuacion
  `);

if (errorValoraciones) {
  console.error("Error cargando valoraciones:", errorValoraciones);
  return;
}

console.log("Valoraciones cargadas:", valoraciones);

const { data: reservas, error: errorReservas } = await supabase
  .from("reservations")
  .select(`
    operacion_id,
    inquilino_id,
    estado
  `);

if (errorReservas) {
  console.error("Error cargando operaciones de usuarios:", errorReservas);
  return;
}

console.log("Reservas para usuarios:", reservas);

    const usuariosConValoracion = (data || []).map((usuario: any) => {
  

  const valoracionesUsuario = (valoraciones || []).filter(
  (valoracion: any) => valoracion.to_user_id === usuario.id
);

const promedioValoracion =
  valoracionesUsuario.length > 0
    ? valoracionesUsuario.reduce(
        (total: number, valoracion: any) =>
          total + valoracion.puntuacion,
        0
      ) / valoracionesUsuario.length
    : null;

const operacionesUsuario = [
  ...new Set(
    (reservas || [])
      .filter(
        (reserva: any) =>
          reserva.inquilino_id === usuario.id &&
          reserva.operacion_id
      )
      .map((reserva: any) => reserva.operacion_id)
  ),
];

const operacionesCanceladas = [
  ...new Set(
    (reservas || [])
      .filter(
        (reserva: any) =>
          reserva.inquilino_id === usuario.id &&
          reserva.estado === "cancelada" &&
          reserva.operacion_id
      )
      .map((reserva: any) => reserva.operacion_id)
  ),
];



return {
  ...usuario,
  valoracion: promedioValoracion,
  operaciones: operacionesUsuario.length,
  canceladas: operacionesCanceladas.length,
};
});

console.log("Usuarios con valoración:", usuariosConValoracion);

setUsuarios(usuariosConValoracion);
  }

  cargarUsuarios();
}, []);

const usuariosFiltrados = usuarios.filter((usuario: any) => {
  const coincideNombre =
    usuario.nombre
      ?.toLowerCase()
      .includes(filtroNombre.toLowerCase()) ?? false;

  const coincideProvincia =
    filtroProvincia === "" ||
    usuario.provincia === filtroProvincia;

  const coincideTelefono =
    usuario.telefono
      ?.toLowerCase()
      .includes(filtroTelefono.toLowerCase()) ?? false;

  const coincideEmail =
  usuario.email
    ?.toLowerCase()
    .includes(filtroEmail.toLowerCase()) ?? false;

    const coincideRol =
  filtroRol === "" ||
  (filtroRol === "admin" && usuario.es_admin) ||
  (filtroRol === "usuario" && !usuario.es_admin);

  return (
  coincideNombre &&
  coincideProvincia &&
  coincideTelefono &&
  coincideEmail &&
  coincideRol
);
});

const usuariosOrdenados = [...usuariosFiltrados].sort(
  (a: any, b: any) => {
    const fechaA = new Date(a.created_at).getTime();
    const fechaB = new Date(b.created_at).getTime();

    if (ordenRegistro === "nuevos") {
      return fechaB - fechaA;
    }

    return fechaA - fechaB;
  }
);

  return (
    <div>
      <button
        onClick={() => (window.location.href = "/admin")}
        style={{
          background: "transparent",
          border: "1px solid #333",
          color: "#FFFFFF",
          padding: "10px 16px",
          borderRadius: "8px",
          cursor: "pointer",
          marginBottom: "20px",
        }}
      >
        ← Volver al panel de administrador
      </button>

      <h1
        style={{
          color: "#FFFFFF",
          marginBottom: "10px",
        }}
      >
        Usuarios
      </h1>

      <p
        style={{
          color: "#999",
          marginBottom: "30px",
        }}
      >
        Administrá y consultá los usuarios registrados en Localiar.
      </p>
      
      <UsuariosTable
  usuarios={usuariosOrdenados}
  filtroNombre={filtroNombre}
  setFiltroNombre={setFiltroNombre}
  filtroProvincia={filtroProvincia}
  setFiltroProvincia={setFiltroProvincia}
    filtroTelefono={filtroTelefono}
  setFiltroTelefono={setFiltroTelefono}
  filtroEmail={filtroEmail}
setFiltroEmail={setFiltroEmail}
filtroRol={filtroRol}
setFiltroRol={setFiltroRol}
ordenRegistro={ordenRegistro}
setOrdenRegistro={setOrdenRegistro}
  provincias={
  Array.from(
    new Set(
      usuarios
        .map((u: any) => u.provincia)
        .filter(Boolean)
    )
  ).sort()
}
/>
    </div>
  );
}