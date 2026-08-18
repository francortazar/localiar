"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import Link from "next/link";
import { enviarEmailPublicacionVencida } from "../../lib/enviarEmailPublicacionVencida";

export default function PublicacionesVencidasPage() {
  const [publicaciones, setPublicaciones] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarPublicacionesVencidas();
  }, []);

  async function cargarPublicacionesVencidas() {
    setCargando(true);

    const hoy = new Date()
      .toISOString()
      .split("T")[0];

    const { data: publicaciones, error } =
      await supabase
        .from("publications")
        .select(`
          id,
          titulo,
          owner_id,
          disponibilidad_total,
          profiles (
            nombre,
            email
          )
        `)
        .eq("disponibilidad_total", false);

    if (error) {
      console.error(error);
      setCargando(false);
      return;
    }

    if (!publicaciones) {
      setPublicaciones([]);
      setCargando(false);
      return;
    }

    const vencidas = [];

    for (const publicacion of publicaciones) {
      const { data: fechas } =
        await supabase
          .from("publication_availability")
          .select("fecha")
          .eq(
            "publication_id",
            publicacion.id
          )
          .gte("fecha", hoy)
          .order("fecha", {
            ascending: true,
          });

      if (!fechas || fechas.length === 0) {
        vencidas.push(publicacion);
      }
    }

    setPublicaciones(vencidas);
    setCargando(false);
  }

  async function eliminarPublicacion(
    id: string,
    titulo: string
  ) {
    const confirmar = window.confirm(
      `¿Seguro que querés eliminar la publicación "${titulo}"?`
    );

    if (!confirmar) return;

    try {
      await enviarEmailPublicacionVencida(id);
    } catch (error) {
      console.error(
        "Error enviando email al propietario:",
        error
      );

      alert(
        "No se pudo enviar el email. La publicación NO fue eliminada."
      );

      return;
    }

    const { error } = await supabase
      .from("publications")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(
        "Error eliminando publicación:",
        error
      );

      alert(
        "El email fue enviado, pero no se pudo eliminar la publicación."
      );

      return;
    }

    setPublicaciones((prev) =>
      prev.filter((p) => p.id !== id)
    );

    alert(
      "Publicación eliminada y propietario notificado correctamente."
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#050505",
        color: "white",
        padding: "30px",
      }}
    >
      <Link
        href="/admin"
        style={{
          display: "inline-block",
          marginBottom: "20px",
          background: "#0D1F3D",
          color: "white",
          padding: "10px 16px",
          borderRadius: "8px",
          textDecoration: "none",
          fontWeight: "bold",
          border: "1px solid #FF7A00",
        }}
      >
        ← Volver a Administración
      </Link>

      <h1
        style={{
          color: "#FF7A00",
          marginBottom: "10px",
        }}
      >
        ⏰ Publicaciones vencidas
      </h1>

      <p
        style={{
          color: "#999",
          marginBottom: "30px",
        }}
      >
        Publicaciones que ya no tienen fechas
        futuras disponibles.
      </p>

      {cargando ? (
        <p>Cargando...</p>
      ) : publicaciones.length === 0 ? (
        <div
          style={{
            background: "#111",
            borderRadius: "12px",
            padding: "20px",
            color: "#999",
          }}
        >
          No hay publicaciones vencidas.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gap: "15px",
          }}
        >
          {publicaciones.map((publicacion) => (
            <div
              key={publicacion.id}
              style={{
                background: "#111",
                border: "1px solid #333",
                borderRadius: "12px",
                padding: "18px",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  marginBottom: "10px",
                  color: "#FF7A00",
                }}
              >
                {publicacion.titulo}
              </h2>

              <p
                style={{
                  margin: "5px 0",
                }}
              >
                👤 Propietario:{" "}
                {publicacion.profiles?.nombre ||
                  "Sin nombre"}
              </p>

              <p
                style={{
                  margin: "5px 0",
                  color: "#999",
                }}
              >
                📧{" "}
                {publicacion.profiles?.email ||
                  "Sin email"}
              </p>

              <p
                style={{
                  marginTop: "12px",
                  color: "#FF5555",
                  fontWeight: "bold",
                }}
              >
                🔴 Sin fechas disponibles
              </p>

              <button
                onClick={() =>
                  eliminarPublicacion(
                    publicacion.id,
                    publicacion.titulo
                  )
                }
                style={{
                  marginTop: "15px",
                  background: "#8B0000",
                  color: "white",
                  border: "none",
                  padding: "10px 16px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                🗑️ Eliminar publicación
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}