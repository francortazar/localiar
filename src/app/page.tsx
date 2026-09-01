"use client";

import { Fragment, useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import Link from "next/link";
import Calendar from "../components/Calendar";
import { obtenerCategorias } from "./lib/categories";
import {
  registrarInteresCategoria,
  registrarInteresProvincia,
  registrarInteresMercado,
} from "./lib/interests";
import { obtenerProvincias } from "./lib/provinces";
import AdvertisingBanner from "../components/AdvertisingBanner";

export default function Home() {
  const [publicaciones, setPublicaciones] = useState<any[]>([]);
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  
  
const [usuario, setUsuario] = useState<any>(null);
const [categorias, setCategorias] = useState<
  { id: string; nombre: string }[]
>([]);
const [filters, setFilters] = useState({
  text: "",
  provincia: "",
  categoria: "",
  fechas: [] as string[],
});
const [provincias, setProvincias] = useState<
  { id: string; nombre: string }[]
>([]);

const publicacionesFiltradas = publicaciones;

useEffect(() => {
  cargarPublicaciones(filters);
}, [filters.text, filters.provincia, filters.categoria, filters.fechas]);

useEffect(() => {
  cargarUsuario();
}, []);

useEffect(() => {
  cargarCategorias();
}, []);

useEffect(() => {
  cargarProvincias();
}, []);

async function cargarPublicaciones(filters?: any) {

const { data, error } = await supabase.rpc(
  "search_publications",
  {
    p_text: filters?.text || "",
    p_provincia:
  provincias.find(
    (p) => p.id === filters?.provincia
  )?.nombre || "",
    p_categoria:
  categorias.find(
    (c) => c.id === filters?.categoria
  )?.nombre || "",
    p_fechas: filters?.fechas || [],
  }
);

if (error) {
  console.log(error);
  return;
}

const publicacionesConRating = await Promise.all(
  (data || []).map(async (pub: any) => {
    const { data: reviews } = await supabase
      .from("reviews")
      .select("puntuacion")
      .eq("publication_id", pub.id)
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

setPublicaciones(publicacionesConRating);

console.log("FILTERS:", filters);

console.log("=== PRIMERA PUBLICACION COMPLETA ===");
console.log(publicacionesConRating?.[0]);

console.log(publicacionesConRating);

console.log("DATA:", publicacionesConRating);
console.log("ERROR:", error);

  
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

async function cargarCategorias() {
  const data = await obtenerCategorias();

  setCategorias(data);

  console.log("CATEGORÍAS HOME:", data);
}

async function cargarProvincias() {
  const data = await obtenerProvincias();

  setProvincias(data);

  console.log("PROVINCIAS HOME:", data);
}

const bloquesPublicaciones = [];

for (
  let i = 0;
  i < publicacionesFiltradas.length;
  i += 4
) {
  bloquesPublicaciones.push(
    publicacionesFiltradas.slice(i, i + 4)
  );
}

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
          <div
  style={{
    display: "flex",
    alignItems: "baseline",
    gap: "10px",
    flexWrap: "wrap",
  }}
>
  <h1
    style={{
      color: "#FF7A00",
      fontSize: "24px",
      fontWeight: "bold",
      margin: 0,
    }}
  >
    LOCALIAR
  </h1>

  <span
    style={{
      color: "#FFFFFF",
      fontSize: "14px",
      fontWeight: "300",
      fontStyle: "italic",
      letterSpacing: "0.3px",
    }}
  >
    alquiler temporal de espacios comerciales
  </span>
</div>

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
      ? provincias.find(
          (p) => p.id === filters.provincia
        )?.nombre
      : "Todas"}
  </button>

  {filters.provincia === "__open" && (
    <div
      style={{
  position: "fixed",
  top: "150px",
  left: "12px",
  right: "12px",
  background: "#111",
  border: "1px solid #FF7A00",
  borderRadius: "10px",
  zIndex: 9999,
  maxHeight: "60vh",
  overflowY: "auto",
}}
    >
      {[
  { id: "todas", nombre: "Todas" },
  ...provincias,
].map((prov) => (
        <div
          key={prov.id}
          onClick={async () => {
  if (prov.nombre !== "Todas" && filters.provincia !== prov.nombre) {
  await registrarInteresProvincia(prov.id);

  if (filters.categoria) {
    const categoriaSeleccionada = categorias.find(
      (c) => c.nombre === filters.categoria
    );

    if (categoriaSeleccionada) {
      await registrarInteresMercado(
        categoriaSeleccionada.id,
        prov.id
      );
    }
  }
}

  setFilters({
  ...filters,
  provincia:
    prov.nombre === "Todas"
      ? ""
      : prov.id,
});
}}
          style={{
            padding: "10px",
            cursor: "pointer",
            borderBottom: "1px solid #222",
            color: "white",
          }}
        >
        {prov.nombre}
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
  <button
    onClick={() =>
      setFilters({
        ...filters,
        categoria: "",
      })
    }
    style={{
      whiteSpace: "nowrap",
      padding: "8px 14px",
      borderRadius: "999px",
      border: "1px solid #FF7A00",
      background: !filters.categoria ? "#FF7A00" : "transparent",
      color: "white",
      fontWeight: "bold",
      cursor: "pointer",
    }}
  >
    Todas
  </button>

  {categorias.map((categoria) => (
    <button
      key={categoria.id}
     onClick={async () => {
  if (filters.categoria !== categoria.nombre) {
  await registrarInteresCategoria(categoria.id);

  if (filters.provincia) {
    const provinciaSeleccionada = provincias.find(
      (p) => p.nombre === filters.provincia
    );

    if (provinciaSeleccionada) {
      await registrarInteresMercado(
        categoria.id,
        provinciaSeleccionada.id
      );
    }
  }
}

setFilters({
  ...filters,
  categoria:
    filters.categoria === categoria.id
      ? ""
      : categoria.id,
});
}}
      style={{
        whiteSpace: "nowrap",
        padding: "8px 14px",
        borderRadius: "999px",
        border: "1px solid #FF7A00",
        background:
  filters.categoria === categoria.id
    ? "#FF7A00"
    : "transparent",
        color: "white",
        fontWeight: "bold",
        cursor: "pointer",
      }}
    >
      {categoria.nombre}
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
  style={{
    marginTop: "260px",
    marginBottom: "20px",
    paddingLeft: "10px",
    paddingRight: "10px",
  }}
>
  <AdvertisingBanner filters={filters} />
</div>

<div
  className="grid grid-cols-2 md:grid-cols-4 gap-3"
  style={{
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
  {pub.cantidadReviews > 0
    ? `⭐ ${pub.promedioRating.toFixed(1)} · ${pub.cantidadReviews} valoraciones`
    : "Sin valoraciones"}
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
        

   {(index + 1) % 12 === 0 && (
  <div
    style={{
      gridColumn: "1 / -1",
      width: "100%",
      marginTop: "10px",
      marginBottom: "10px",
    }}
  >
    <AdvertisingBanner filters={filters} />
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