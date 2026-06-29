"use client";

import { Fragment, useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import Link from "next/link";
import Calendar from "../components/Calendar";

export default function Home() {
  const [publicaciones, setPublicaciones] = useState<any[]>([]);
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  
  
const [usuario, setUsuario] = useState<any>(null);
const [filters, setFilters] = useState({
  text: "",
  provincia: "",
  categoria: "",
  fechas: [] as string[],
});

const publicacionesFiltradas = publicaciones;

useEffect(() => {
  cargarPublicaciones(filters);
}, [filters.text, filters.provincia, filters.categoria, filters.fechas]);

useEffect(() => {
  cargarUsuario();
}, []);

async function cargarPublicaciones(filters?: any) {

const { data, error } = await supabase.rpc(
  "search_publications",
  {
    p_text: filters?.text || "",
    p_provincia: filters?.provincia || "",
    p_categoria: filters?.categoria || "",
    p_fechas: filters?.fechas || [],
  }
);

if (error) {
  console.log(error);
  return;
}

setPublicaciones(data || []);

  console.log("FILTERS:", filters);

  console.log("=== PRIMERA PUBLICACION COMPLETA ===");
console.log(data?.[0]);



  console.log(data);

  console.log("DATA:", data);
console.log("ERROR:", error);

  if (error) {
    console.log("❌ SUPABASE ERROR:", error);
    return;
  }

  
}


async function cargarUsuario() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("nombre")
      .eq("id", user.id)
      .single();

    setUsuario(data);
  }
}

const provincias = [
  "Todas",
  "San Luis",
  "Buenos Aires",
  "Córdoba",
  "Mendoza",
  "CABA",
];



  return (
    <main
      style={{
        background: "#050505",
        minHeight: "100vh",
        color: "white",
      }}
    >
      <header
        style={{
          position: "fixed",
          overflow: "visible",
          top: 0,
          left: 0,
          right: 0,
          background: "#0D1F3D",
          padding: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
          zIndex: 1000,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <h1
            style={{
              color: "#FF7A00",
              fontSize: "24px",
              fontWeight: "bold",
            }}
          >
            LOCALIAR
          </h1>

          <button
            style={{
              background: "transparent",
              border: "none",
              color: "white",
              fontSize: "22px",
              cursor: "pointer",
            }}
          >
            🔔
          </button>
        </div>

        <input
  type="text"
  placeholder="🔍 Buscar espacios..."
  value={filters.text}
  onChange={(e) =>
    setFilters({ ...filters, text: e.target.value })
  }
  style={{
    width: "100%",
    padding: "10px 14px",
    borderRadius: "10px",
    border: "1px solid #FF7A00",
    background: "#0D1F3D",
    color: "white",
    outline: "none",
    marginTop: "10px",
  }}
/>
        <div
  style={{
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "10px",
    marginTop: "10px",
    width: "100%",
  }}
>
  
  <div style={{ position: "relative" }}>
  <button
    onClick={() =>
      setFilters({
        ...filters,
        provincia:
          filters.provincia === "__open" ? "" : "__open",
      })
    }
    style={{
      width: "100%",
      padding: "10px",
      borderRadius: "10px",
      border: "1px solid #FF7A00",
      background: "#0D1F3D",
      color: "white",
      fontWeight: "bold",
      cursor: "pointer",
    }}
  >
    📍 {filters.provincia && filters.provincia !== "__open"
      ? filters.provincia
      : "Todas"}
  </button>

  {filters.provincia === "__open" && (
    <div
      style={{
        
        position: "absolute",
        top: "45px",
        left: 0,
        background: "#111",
        border: "1px solid #FF7A00",
        borderRadius: "10px",
        width: "200px",
        zIndex: 9999,
        overflow: "hidden",
      }}
    >
      {[
        "Todas",
        "San Luis",
        "Buenos Aires",
        "Córdoba",
        "Mendoza",
        "CABA",
      ].map((prov) => (
        <div
          key={prov}
          onClick={() =>
            setFilters({
              ...filters,
              provincia: prov === "Todas" ? "" : prov,
            })
          }
          style={{
            padding: "10px",
            cursor: "pointer",
            borderBottom: "1px solid #222",
            color: "white",
          }}
        >
          {prov}
        </div>
      ))}
    </div>
  )}
</div>




  <button
  onClick={() => setMostrarCalendario(true)}
  style={{
    padding: "10px",
    borderRadius: "10px",
    border: "1px solid #FF7A00",
    background: "#0D1F3D",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
  }}
>
  📅 Fechas
</button>

<button
  onClick={() =>
    setFilters({
      text: "",
      provincia: "",
      categoria: "",
      fechas: [],
    })
  }
  style={{
    padding: "10px",
    borderRadius: "10px",
    border: "1px solid #FF7A00",
    background: "#0D1F3D",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
  }}
>
  ✖ Limpiar
</button>

</div>
<div
  style={{
    display: "flex",
    gap: "8px",
    overflowX: "auto",
    marginTop: "10px",
    paddingBottom: "4px",
  }}
>
  {[
    "Todas",
    "Peluquería",
    "Estética",
    "Gastronomía",
    "Salud",
    "Fitness",
    "Educación",
    "Taller",
    "Comercio",
    "Coworking",
    "Fondo de comercio",
    "Local vacío",
  ].map((categoria) => (
    
    <button
    onClick={() =>
  setFilters({
    ...filters,
    categoria:
      filters.categoria === categoria ? "" : categoria,
  })
}
      key={categoria}
      
      style={{
  whiteSpace: "nowrap",
  padding: "8px 14px",
  borderRadius: "999px",
  border: "1px solid #FF7A00",
  background:
    filters.categoria === categoria ||
    (categoria === "Todas" && !filters.categoria)
      ? "#FF7A00"
      : "transparent",
  color: "white",
  fontWeight: "bold",
  cursor: "pointer",
}}
      
    >
      {categoria}
    </button>
  ))}
</div>
<div
  style={{
    position: "absolute",
    left: 0,
    right: 0,
    bottom: "-20px",
    height: "20px",
    background:
      "linear-gradient(to bottom, #0D1F3D, transparent)",
  }}
/>
      </header>

      {mostrarCalendario && (
  <div
    onClick={() => setMostrarCalendario(false)}
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0,0,0,0.6)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 2000,
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        background: "#111",
        padding: "20px",
        borderRadius: "12px",
        width: "320px",
      }}
    >
      <h3 style={{ marginBottom: "10px" }}>
        Seleccionar fechas
      </h3>

      <Calendar
  fechasReservadas={[]}
  fechasDisponibles={[]}
  disponibilidadTotal={true}
  selectedDates={filters.fechas}
  setSelectedDates={(updater: any) =>
  setFilters((prev) => ({
    ...prev,
    fechas:
      typeof updater === "function"
        ? updater(prev.fechas)
        : updater,
  }))
}
/>

      <button
  onClick={() => {
    console.log("Fechas elegidas:", filters.fechas);
    setMostrarCalendario(false);
  }}
        style={{
          marginTop: "15px",
          width: "100%",
          padding: "10px",
          background: "#FF7A00",
          border: "none",
          color: "white",
          borderRadius: "8px",
        }}
      >
        Listo
      </button>
    </div>
  </div>
)}

      <div
  className="grid grid-cols-2 md:grid-cols-4 gap-3"
  style={{
    paddingTop: "260px",
    paddingBottom: "140px",
    paddingLeft: "10px",
    paddingRight: "10px",
  }}

>



  {publicacionesFiltradas.map((pub, index) => (
  <Fragment key={index}>
    <Link
  href={`/publicacion/${pub.id}`}
  style={{
    textDecoration: "none",
    color: "inherit",
  }}
>
  <div
    style={{
      background: "#111111",
      borderRadius: "16px",
      overflow: "hidden",
      boxShadow: "0 4px 15px rgba(0,0,0,0.5)",
    }}
  >
        
      {pub.publication_images?.length > 0 ? (
  <img
    src={
      [...pub.publication_images]
  .sort((a: any, b: any) => a.orden - b.orden)[0]
  ?.image_url
    }
    alt=""
    style={{
      width: "100%",
      height: "140px",
      objectFit: "cover",
    }}
  />
) : (
  <div
    style={{
      height: "140px",
      background:
        "linear-gradient(135deg,#0D1F3D,#FF7A00)",
    }}
  />
)}

      <div style={{ padding: "10px" }}>
        <h3
  style={{
    fontSize: "14px",
    fontWeight: "bold",
    marginBottom: "6px",
  }}
>
  {pub.titulo}
</h3>
<p
  style={{
    fontSize: "12px",
    marginBottom: "6px",
    color: "#888",
  }}
>
  Sin valoraciones
</p>
        <p
          style={{
            color: "#FF7A00",
            fontWeight: "bold",
            marginBottom: "4px",
          }}
        >
          $
{Number(pub.precio_dia)
  .toLocaleString("es-AR")}
/día
        </p>

        <p
          style={{
            fontSize: "12px",
            color: "#cccccc",
          }}
        >
          {pub.ciudad}
        </p>

        <p
          style={{
            fontSize: "12px",
            color: "#cccccc",
          }}
        >
          {pub.provincia}
        </p>
      </div>
        </div>
        </Link>
        

    {(index + 1) % 20 === 0 && (
      <div
        style={{
          gridColumn: "1 / -1",
          background: "#1a1a1a",
          borderRadius: "16px",
          height: "120px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#FF7A00",
          fontWeight: "bold",
          fontSize: "22px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.5)",
        }}
      >
        ESPACIO PUBLICITARIO
      </div>
        )}
    </Fragment>
))}
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
  href="/publicar"
  style={{
    color: "white",
    fontSize: "16px",
    fontWeight: "bold",
    textDecoration: "none",
  }}
>
  ➕ Publicar
</Link>

  {usuario ? (
  <Link
    href="/perfil"
    style={{
      color: "white",
      fontSize: "16px",
      fontWeight: "bold",
      textDecoration: "none",
    }}
  >
    👤 {usuario.nombre}
  </Link>
) : (
  <Link
    href="/login"
    style={{
      color: "white",
      fontSize: "16px",
      fontWeight: "bold",
      textDecoration: "none",
    }}
  >
    🔑 Iniciar sesión
  </Link>
)}
</footer>
    </main>
  );
}