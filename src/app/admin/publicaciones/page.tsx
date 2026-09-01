
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

type Publicacion = {
  id: string;
  titulo: string;
  descripcion: string | null;
  provincia: string | null;
  ciudad: string | null;
  direccion: string | null;
  precio_dia: number | null;
  created_at: string;
  owner_id: string;
};

export default function PublicacionesPage() {
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarPublicaciones();
  }, []);

  async function cargarPublicaciones() {
    setCargando(true);

    const { data, error } = await supabase
      .from("publications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error cargando publicaciones:", error);
      alert("No se pudieron cargar las publicaciones.");
      setCargando(false);
      return;
    }

    setPublicaciones(data || []);
    setCargando(false);
  }

  async function eliminarPublicacion(id: string) {
  const confirmar = window.confirm(
    "¿Estás seguro de que querés eliminar esta publicación?\n\nSe eliminarán también sus fotos, categorías y disponibilidad.\n\nEsta acción no se puede deshacer."
  );

  if (!confirmar) {
    return;
  }

  console.log("ELIMINANDO PUBLICACIÓN:", id);

  // 1. Eliminar imágenes
  const { error: imagesError } = await supabase
    .from("publication_images")
    .delete()
    .eq("publication_id", id);

  if (imagesError) {
    console.error("ERROR IMÁGENES:", imagesError);
    alert(
      "Error eliminando imágenes:\n\n" +
        imagesError.message
    );
    return;
  }

  // 2. Eliminar categorías
  const { error: categoriesError } = await supabase
    .from("publication_categories")
    .delete()
    .eq("publication_id", id);

  if (categoriesError) {
    console.error("ERROR CATEGORÍAS:", categoriesError);
    alert(
      "Error eliminando categorías:\n\n" +
        categoriesError.message
    );
    return;
  }

  // 3. Eliminar disponibilidad
  const { error: availabilityError } = await supabase
    .from("publication_availability")
    .delete()
    .eq("publication_id", id);

  if (availabilityError) {
    console.error(
      "ERROR DISPONIBILIDAD:",
      availabilityError
    );

    alert(
      "Error eliminando disponibilidad:\n\n" +
        availabilityError.message
    );
    return;
  }

  // 4. Eliminar publicación
  const { error: publicationError } = await supabase
    .from("publications")
    .delete()
    .eq("id", id);

  console.log(
    "RESULTADO DELETE PUBLICATION:",
    publicationError
  );

  if (publicationError) {
    console.error(
      "ERROR PUBLICACIÓN:",
      publicationError
    );

    alert(
      "ERROR ELIMINANDO LA PUBLICACIÓN:\n\n" +
        publicationError.message
    );

    return;
  }

  // 5. Actualizar pantalla
  setPublicaciones((actuales) =>
    actuales.filter(
      (publicacion) => publicacion.id !== id
    )
  );

  alert("Publicación eliminada correctamente.");
}

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#050505",
        color: "white",
        padding: "30px",
        paddingBottom: "100px",
      }}
    >
      <Link
        href="/admin"
        style={{
          display: "inline-block",
          background: "transparent",
          border: "1px solid #333",
          color: "white",
          padding: "10px 16px",
          borderRadius: "8px",
          cursor: "pointer",
          marginBottom: "25px",
          textDecoration: "none",
        }}
      >
        ← Volver al panel de administración
      </Link>

      <h1
        style={{
          color: "#FF7A00",
          marginBottom: "30px",
        }}
      >
        📋 Publicaciones
      </h1>

      {cargando ? (
        <p style={{ color: "#999" }}>
          Cargando publicaciones...
        </p>
      ) : publicaciones.length === 0 ? (
        <p style={{ color: "#999" }}>
          No hay publicaciones guardadas.
        </p>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "15px",
          }}
        >
          {publicaciones.map((publicacion) => (
            <Link
  key={publicacion.id}
  href={`/publicacion/${publicacion.id}`}
  style={{
    position: "relative",
    display: "block",
    background: "#111",
    border: "1px solid #333",
    borderRadius: "12px",
    padding: "20px",
    paddingRight: "60px",
    textDecoration: "none",
    color: "inherit",
    cursor: "pointer",
  }}
>
              <button
               onClick={(e) => {
  e.preventDefault();
  e.stopPropagation();
  eliminarPublicacion(publicacion.id);
}}
                title="Eliminar publicación"
                style={{
                  position: "absolute",
                  top: "12px",
                  right: "12px",
                  background: "transparent",
                  border: "none",
                  color: "#888",
                  fontSize: "22px",
                  cursor: "pointer",
                  lineHeight: 1,
                }}
              >
                ✕
              </button>

              <h3
                style={{
                  color: "white",
                  marginTop: 0,
                  marginBottom: "15px",
                  fontSize: "20px",
                }}
              >
                {publicacion.titulo}
              </h3>

              <p
                style={{
                  color: "#ddd",
                  margin: "6px 0",
                }}
              >
                <strong>Provincia:</strong>{" "}
                {publicacion.provincia || "-"}
              </p>

              <p
                style={{
                  color: "#ddd",
                  margin: "6px 0",
                }}
              >
                <strong>Ciudad:</strong>{" "}
                {publicacion.ciudad || "-"}
              </p>

              <p
                style={{
                  color: "#ddd",
                  margin: "6px 0",
                }}
              >
                <strong>Dirección:</strong>{" "}
                {publicacion.direccion || "-"}
              </p>

              <p
                style={{
                  color: "#FF7A00",
                  fontWeight: "bold",
                  margin: "10px 0",
                }}
              >
                <strong>Precio por día:</strong>{" "}
                $
                {Number(
                  publicacion.precio_dia || 0
                ).toLocaleString("es-AR")}
              </p>

              <p
                style={{
                  color: "#777",
                  margin: "10px 0 0",
                  fontSize: "13px",
                }}
              >
                Publicada:{" "}
                {publicacion.created_at
                  ? new Date(
                      publicacion.created_at
                    ).toLocaleString("es-AR")
                  : "-"}
              </p>

              <p
                style={{
                  color: "#555",
                  margin: "6px 0 0",
                  fontSize: "11px",
                  wordBreak: "break-all",
                }}
              >
                ID: {publicacion.id}
              </p>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
