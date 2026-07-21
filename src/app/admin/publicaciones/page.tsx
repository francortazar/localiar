"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function PublicacionesPage() {

  const [publicaciones, setPublicaciones] = useState<any[]>([]);
  const [ordenCreacion, setOrdenCreacion] =
  useState<"desc" | "asc">("desc");

const [buscarTitulo, setBuscarTitulo] =
  useState("");

const [categoriaFiltro, setCategoriaFiltro] =
  useState("");

const [provinciaFiltro, setProvinciaFiltro] =
  useState("");

const [buscarPropietario, setBuscarPropietario] =
  useState("");

  useEffect(() => {
    async function cargarPublicaciones() {

      const { data, error } = await supabase
  .from("publications")
  .select(`
    id,
    titulo,
    provincia,
    ciudad,
    precio_dia,
    activo,
    created_at,
    alias_pago,
    owner_id,
    profiles!publications_owner_id_fkey (
  nombre
),
publication_categories (
  categoria
),
reviews (
  puntuacion,
  type
),
reservations (
  id,
  operacion_id,
  estado_pago
)
  `)
  .order("created_at", {
    ascending: false,
  });


      if (error) {
        console.error(
          "Error cargando publicaciones:",
          error
        );
        return;
      }

      console.log(
        "Publicaciones cargadas:",
        data
      );

      const publicacionesProcesadas = (data || []).map((pub: any) => {
  const reviewsPublicacion =
    (pub.reviews || []).filter(
      (r: any) =>
        r.type === "renter_to_publication"
    );

  const valoracion =
    reviewsPublicacion.length > 0
      ? (
          reviewsPublicacion.reduce(
            (acc: number, r: any) =>
              acc + r.puntuacion,
            0
          ) / reviewsPublicacion.length
        ).toFixed(1)
      : "-";

  const operacionesPagadas = new Set(
    (pub.reservations || [])
      .filter(
        (r: any) =>
          r.estado_pago === "pagado"
      )
      .map(
        (r: any) => r.operacion_id
      )
  ).size;

  const capitalizacion =
    operacionesPagadas *
    Number(pub.precio_dia) *
    0.925;

    const categorias =
  (pub.publication_categories || [])
    .map((c: any) => c.categoria)
    .join(", ");

  return {
  ...pub,
  categorias,
  valoracion,
  operacionesPagadas,
  capitalizacion,
};
});

      setPublicaciones(publicacionesProcesadas);
    }

    cargarPublicaciones();

  }, []);

  const provincias = Array.from(
  new Set(
    publicaciones.map(
      (p) => p.provincia
    )
  )
).sort();

const categorias = Array.from(
  new Set(
    publicaciones.flatMap(
      (p) =>
        p.categorias
          ? p.categorias
              .split(", ")
              .map((c: string) => c.trim())
          : []
    )
  )
).sort();

const publicacionesFiltradas =
  [...publicaciones]
    .filter((p) =>
      p.titulo
        .toLowerCase()
        .includes(
          buscarTitulo.toLowerCase()
        )
    )
    .filter((p) =>
      provinciaFiltro === ""
        ? true
        : p.provincia ===
          provinciaFiltro
    )
    .filter((p) =>
      categoriaFiltro === ""
        ? true
        : p.categorias
            ?.split(", ")
            .includes(categoriaFiltro)
    )
    .filter((p) =>
      p.profiles?.nombre
        ?.toLowerCase()
        .includes(
          buscarPropietario.toLowerCase()
        )
    )
    .sort((a, b) =>
      ordenCreacion === "desc"
        ? new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
        : new Date(a.created_at).getTime() -
          new Date(b.created_at).getTime()
    );

    const inputFiltro = {
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #444",
  background: "#1f2937",
  color: "white",
  minWidth: "180px",
};

  return (
    <div
      style={{
        padding: "30px",
        color: "#FFFFFF",
      }}
    >

      <button
        onClick={() =>
          window.location.href="/admin"
        }
        style={{
          marginBottom:"20px",
          padding:"10px 18px",
          borderRadius:"8px",
          border:"none",
          cursor:"pointer",
        }}
      >
        ← Volver al panel
      </button>


      <h1>
        Publicaciones
      </h1>


      <p
        style={{
          color:"#999",
        }}
      >
        Gestión de locales publicados en Localiar.
      </p>


      <p
  style={{
    marginBottom: "20px",
    fontWeight: "bold",
  }}
>
  Total publicaciones: {publicacionesFiltradas.length}
</p>

<div
  style={{
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "25px",
    alignItems: "center",
  }}
>
  <select
    value={ordenCreacion}
    onChange={(e) =>
      setOrdenCreacion(
        e.target.value as "asc" | "desc"
      )
    }
    style={inputFiltro}
  >
    <option value="desc">
      Más recientes
    </option>

    <option value="asc">
      Más antiguas
    </option>
  </select>

  <input
    type="text"
    placeholder="Buscar título..."
    value={buscarTitulo}
    onChange={(e) =>
      setBuscarTitulo(e.target.value)
    }
    style={inputFiltro}
  />

  <select
    value={categoriaFiltro}
    onChange={(e) =>
      setCategoriaFiltro(e.target.value)
    }
    style={inputFiltro}
  >
    <option value="">
      Todas las categorías
    </option>

    {categorias.map((categoria) => (
      <option
        key={categoria}
        value={categoria}
      >
        {categoria}
      </option>
    ))}
  </select>

  <select
    value={provinciaFiltro}
    onChange={(e) =>
      setProvinciaFiltro(e.target.value)
    }
    style={inputFiltro}
  >
    <option value="">
      Todas las provincias
    </option>

    {provincias.map((provincia) => (
      <option
        key={provincia}
        value={provincia}
      >
        {provincia}
      </option>
    ))}
  </select>

  <input
    type="text"
    placeholder="Buscar propietario..."
    value={buscarPropietario}
    onChange={(e) =>
      setBuscarPropietario(e.target.value)
    }
    style={inputFiltro}
  />
</div>

<div
  style={{
    overflowX: "auto",
  }}
>
  <table
    style={{
      width: "100%",
      borderCollapse: "collapse",
      minWidth: "1700px",
    }}
  >
    <thead>
      <tr
        style={{
          background: "#1f2937",
        }}
      >
        <th style={th}>Creación</th>
        <th style={th}>Título</th>
        <th style={th}>Categoría</th>
        <th style={th}>Provincia</th>
        <th style={th}>Valoración</th>
        <th style={th}>Operaciones</th>
        <th style={th}>Propietario</th>
        <th style={th}>Capitalización</th>
        <th style={th}>Alias</th>
        <th style={th}>Estado</th>
      </tr>
    </thead>

    <tbody>
      {publicacionesFiltradas.map((pub) => (
        <tr
          key={pub.id}
          style={{
            borderBottom: "1px solid #333",
          }}
        >
          <td style={td}>
            {new Date(pub.created_at).toLocaleDateString("es-AR")}
          </td>

          <td style={td}>
            {pub.titulo}
          </td>

          <td style={td}>
            {pub.categorias || "-"}
          </td>

          <td style={td}>
            {pub.provincia}
          </td>

          <td style={td}>
            ⭐ {pub.valoracion}
          </td>

          <td style={td}>
            {pub.operacionesPagadas}
          </td>

          <td style={td}>
            {pub.profiles?.nombre}
          </td>

          <td style={td}>
            $
            {Math.round(pub.capitalizacion).toLocaleString("es-AR")}
          </td>

          <td style={td}>
            {pub.alias_pago || "-"}
          </td>

          <td style={td}>
            {pub.activo ? "Activa" : "Inactiva"}
          </td>
          
        </tr>
      ))}
    </tbody>
  </table>
</div>


    </div>
    
  );
  
}
const th = {
  padding: "12px",
  textAlign: "left" as const,
  borderBottom: "1px solid #444",
  color: "#fff",
};

const td = {
  padding: "12px",
  borderBottom: "1px solid #222",
  color: "#ddd",
};