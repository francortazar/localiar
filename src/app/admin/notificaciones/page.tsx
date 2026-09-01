"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type AdvertisingRequest = {
  id: string;
  nombre: string;
  empresa: string;
  telefono: string;
  email: string;
  estado: string;
  observaciones: string | null;
  created_at: string;
};

type Report = {
  id: string;
  denunciante_id: string;
  usuario_denunciado: string | null;
  publicacion_denunciada: string | null;
  motivo: string;
  estado: string;
  observaciones: string | null;
  created_at: string;
  denunciante?: {
    nombre: string;
    email: string | null;
    telefono: string;
  } | null;
};

type SupportRequest = {
  id: string;
  usuario_id: string;
  consulta: string;
  observaciones: string | null;
  created_at: string;
  usuario?: {
    nombre: string;
    email: string | null;
    telefono: string;
  } | null;
};

export default function NotificacionesPage() {
  const [solicitudes, setSolicitudes] = useState<AdvertisingRequest[]>([]);
const [denuncias, setDenuncias] = useState<Report[]>([]);
const [soportes, setSoportes] = useState<SupportRequest[]>([]);
const [cargando, setCargando] = useState(true);


useEffect(() => {
  cargarSolicitudes();
  cargarDenuncias();
  cargarSoportes();
}, []);

  const cargarSolicitudes = async () => {
    const { data, error } = await supabase
      .from("advertising_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error cargando solicitudes:", error);
      setCargando(false);
      return;
    }

    setSolicitudes(data || []);
    setCargando(false);
  };

  const cargarDenuncias = async () => {
  const { data, error } = await supabase
    .from("reports")
    .select(`
      *,
      denunciante:profiles (
        nombre,
        email,
        telefono
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error cargando denuncias:", error);
    return;
  }

  setDenuncias(data || []);
};

const cargarSoportes = async () => {
  const { data, error } = await supabase
    .from("support_requests")
    .select(`
      *,
      usuario:profiles (
        nombre,
        email,
        telefono
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error cargando consultas de soporte:", error);
    return;
  }

  setSoportes(data || []);
};

  const guardarObservaciones = async (
  id: string,
  observaciones: string
) => {
  const { error } = await supabase
    .from("advertising_requests")
    .update({ observaciones })
    .eq("id", id);

  if (error) {
    console.error("Error guardando observaciones:", error);
    alert("No se pudieron guardar las observaciones.");
    return;
  }

  setSolicitudes((actuales) =>
    actuales.map((solicitud) =>
      solicitud.id === id
        ? { ...solicitud, observaciones }
        : solicitud
    )
  );

  alert("Observaciones guardadas correctamente.");
};

const eliminarSolicitud = async (id: string) => {
  const confirmar = window.confirm(
    "¿Estás seguro de que querés eliminar esta solicitud? Esta acción no se puede deshacer."
  );

  if (!confirmar) {
    return;
  }

  const { error } = await supabase
    .from("advertising_requests")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error eliminando solicitud:", error);
    alert("No se pudo eliminar la solicitud.");
    return;
  }

  setSolicitudes((actuales) =>
    actuales.filter((solicitud) => solicitud.id !== id)
  );
};

const guardarObservacionesDenuncia = async (
  id: string,
  observaciones: string
) => {
  const { error } = await supabase
    .from("reports")
    .update({ observaciones })
    .eq("id", id);

  if (error) {
    console.error(
      "Error guardando observaciones de denuncia:",
      error
    );
    alert("No se pudieron guardar las observaciones.");
    return;
  }

  setDenuncias((actuales) =>
    actuales.map((denuncia) =>
      denuncia.id === id
        ? { ...denuncia, observaciones }
        : denuncia
    )
  );

  alert("Observaciones guardadas correctamente.");
};

const eliminarDenuncia = async (id: string) => {
  const confirmar = window.confirm(
    "¿Estás seguro de que querés eliminar esta denuncia? Esta acción no se puede deshacer."
  );

  if (!confirmar) {
    return;
  }

  const { error } = await supabase
    .from("reports")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error eliminando denuncia:", error);
    alert("No se pudo eliminar la denuncia.");
    return;
  }

  setDenuncias((actuales) =>
    actuales.filter((denuncia) => denuncia.id !== id)
  );
};

const guardarObservacionesSoporte = async (
  id: string,
  observaciones: string
) => {
  const { error } = await supabase
    .from("support_requests")
    .update({ observaciones })
    .eq("id", id);

  if (error) {
    console.error(
      "Error guardando observaciones de soporte:",
      error
    );
    alert("No se pudieron guardar las observaciones.");
    return;
  }

  setSoportes((actuales) =>
    actuales.map((soporte) =>
      soporte.id === id
        ? { ...soporte, observaciones }
        : soporte
    )
  );

  alert("Observaciones guardadas correctamente.");
};

  return (
    <div style={{ padding: "30px" }}>

        <button
  onClick={() => {
    window.location.href = "/admin";
  }}
  style={{
    background: "transparent",
    border: "1px solid #333",
    color: "white",
    padding: "10px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    marginBottom: "25px",
  }}
>
  ← Volver al panel de administración
</button>
      <h1
        style={{
          color: "white",
          marginBottom: "30px",
        }}
      >
        🔔 Notificaciones
      </h1>

      {cargando ? (
        <p style={{ color: "#999" }}>Cargando notificaciones...</p>
      ) : solicitudes.length === 0 &&
  denuncias.length === 0 &&
  soportes.length === 0 ? (
  <p style={{ color: "#999" }}>
    No hay notificaciones.
  </p>
) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "15px",
          }}
        >
          {solicitudes.map((solicitud) => (
            <div
  key={solicitud.id}
  style={{
    position: "relative",
    background: "#111",
    border: "1px solid #333",
    borderRadius: "12px",
    padding: "20px",
  }}
>
  <button
    onClick={() => eliminarSolicitud(solicitud.id)}
    title="Eliminar solicitud"
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
                }}
              >
                📢 Solicitud de publicidad
              </h3>

              <p style={{ color: "#ddd", margin: "6px 0" }}>
                <strong>Nombre:</strong> {solicitud.nombre}
              </p>

              <p style={{ color: "#ddd", margin: "6px 0" }}>
                <strong>Empresa:</strong> {solicitud.empresa}
              </p>

              <p style={{ color: "#ddd", margin: "6px 0" }}>
                <strong>Teléfono:</strong> {solicitud.telefono}
              </p>

              <p style={{ color: "#ddd", margin: "6px 0" }}>
                <strong>Email:</strong> {solicitud.email}
              </p>

              <p style={{ color: "#aaa", margin: "6px 0" }}>
                <strong>Estado:</strong> {solicitud.estado}
              </p>

              <p style={{ color: "#777", margin: "10px 0 0" }}>
                {new Date(solicitud.created_at).toLocaleString("es-AR")}
              </p>

              <div style={{ marginTop: "20px" }}>
  <label
    style={{
      display: "block",
      color: "white",
      fontWeight: "bold",
      marginBottom: "8px",
    }}
  >
    Observaciones
  </label>

  <textarea
    defaultValue={solicitud.observaciones || ""}
    placeholder="Anotá aquí lo que hables con el cliente..."
    rows={4}
    id={`observaciones-${solicitud.id}`}
    style={{
      width: "100%",
      boxSizing: "border-box",
      padding: "12px",
      borderRadius: "8px",
      border: "1px solid #333",
      background: "#222",
      color: "white",
      fontSize: "15px",
      resize: "vertical",
    }}
  />

  <button
    onClick={() => {
      const textarea = document.getElementById(
        `observaciones-${solicitud.id}`
      ) as HTMLTextAreaElement;

      guardarObservaciones(
        solicitud.id,
        textarea.value
      );
    }}
    style={{
      marginTop: "10px",
      padding: "10px 16px",
      borderRadius: "8px",
      border: "none",
      background: "#FF7A00",
      color: "white",
      fontWeight: "bold",
      cursor: "pointer",
    }}
  >
    Guardar observaciones
  </button>
</div>
            </div>
          ))}

              {denuncias.map((denuncia) => (
            <div
              key={denuncia.id}
              style={{
                position: "relative",
                background: "#111",
                border: "1px solid #333",
                borderRadius: "12px",
                padding: "20px",
              }}
            >
<button
  onClick={() => eliminarDenuncia(denuncia.id)}
  title="Eliminar denuncia"
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
                }}
              >
                🚩 Denuncia recibida
              </h3>

              <p style={{ color: "#ddd", margin: "6px 0" }}>
                <strong>Denunciante:</strong>{" "}
                {denuncia.denunciante?.nombre || "No disponible"}
              </p>

              <p style={{ color: "#ddd", margin: "6px 0" }}>
                <strong>Email:</strong>{" "}
                {denuncia.denunciante?.email || "No disponible"}
              </p>

              <p style={{ color: "#ddd", margin: "6px 0" }}>
                <strong>Teléfono:</strong>{" "}
                {denuncia.denunciante?.telefono || "No disponible"}
              </p>

              <p style={{ color: "#ddd", margin: "6px 0" }}>
                <strong>Usuario denunciado:</strong>{" "}
                {denuncia.usuario_denunciado || "No especificado"}
              </p>

              <p style={{ color: "#ddd", margin: "6px 0" }}>
                <strong>Publicación denunciada:</strong>{" "}
                {denuncia.publicacion_denunciada || "No especificada"}
              </p>

              <p
                style={{
                  color: "#ddd",
                  margin: "15px 0 6px",
                }}
              >
                <strong>Motivo de la denuncia:</strong>
              </p>

              <div
                style={{
                  background: "#222",
                  borderRadius: "8px",
                  padding: "12px",
                  color: "#ddd",
                  whiteSpace: "pre-wrap",
                }}
              >
                {denuncia.motivo}
              </div>

              <p style={{ color: "#aaa", margin: "12px 0 0" }}>
                <strong>Estado:</strong> {denuncia.estado}
              </p>

              <p style={{ color: "#777", margin: "10px 0 0" }}>
                {new Date(denuncia.created_at).toLocaleString("es-AR")}
              </p>

              <div style={{ marginTop: "20px" }}>
  <label
    style={{
      display: "block",
      color: "white",
      fontWeight: "bold",
      marginBottom: "8px",
    }}
  >
    Observaciones
  </label>

  <textarea
    defaultValue={denuncia.observaciones || ""}
    placeholder="Anotá aquí las acciones realizadas sobre esta denuncia..."
    rows={4}
    id={`observaciones-denuncia-${denuncia.id}`}
    style={{
      width: "100%",
      boxSizing: "border-box",
      padding: "12px",
      borderRadius: "8px",
      border: "1px solid #333",
      background: "#222",
      color: "white",
      fontSize: "15px",
      resize: "vertical",
    }}
  />

  <button
    onClick={() => {
      const textarea = document.getElementById(
        `observaciones-denuncia-${denuncia.id}`
      ) as HTMLTextAreaElement;

      guardarObservacionesDenuncia(
        denuncia.id,
        textarea.value
      );
    }}
    style={{
      marginTop: "10px",
      padding: "10px 16px",
      borderRadius: "8px",
      border: "none",
      background: "#FF7A00",
      color: "white",
      fontWeight: "bold",
      cursor: "pointer",
    }}
  >
    Guardar observaciones
  </button>
</div>

            </div>
          ))}

                    {soportes.map((soporte) => (
            <div
              key={soporte.id}
              style={{
                position: "relative",
                background: "#111",
                border: "1px solid #333",
                borderRadius: "12px",
                padding: "20px",
              }}
            >
              <button
                onClick={async () => {
                  const confirmar = window.confirm(
                    "¿Estás seguro de que querés eliminar esta consulta? Esta acción no se puede deshacer."
                  );

                  if (!confirmar) {
                    return;
                  }

                  const { error } = await supabase
                    .from("support_requests")
                    .delete()
                    .eq("id", soporte.id);

                  if (error) {
                    console.error(
                      "Error eliminando consulta:",
                      error
                    );
                    alert("No se pudo eliminar la consulta.");
                    return;
                  }

                  setSoportes((actuales) =>
                    actuales.filter(
                      (item) => item.id !== soporte.id
                    )
                  );
                }}
                title="Eliminar consulta"
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
                }}
              >
                🛠️ Consulta de soporte
              </h3>

              <p
                style={{
                  color: "#ddd",
                  margin: "6px 0",
                }}
              >
                <strong>Nombre:</strong>{" "}
                {soporte.usuario?.nombre || "No disponible"}
              </p>

              <p
                style={{
                  color: "#ddd",
                  margin: "6px 0",
                }}
              >
                <strong>Email:</strong>{" "}
                {soporte.usuario?.email || "No disponible"}
              </p>

              <p
                style={{
                  color: "#ddd",
                  margin: "6px 0",
                }}
              >
                <strong>Teléfono:</strong>{" "}
                {soporte.usuario?.telefono || "No disponible"}
              </p>

              <p
                style={{
                  color: "#ddd",
                  margin: "15px 0 6px",
                }}
              >
                <strong>Consulta:</strong>
              </p>

              <div
                style={{
                  background: "#222",
                  borderRadius: "8px",
                  padding: "12px",
                  color: "#ddd",
                  whiteSpace: "pre-wrap",
                }}
              >
                {soporte.consulta}
              </div>

              <p
                style={{
                  color: "#777",
                  margin: "10px 0 0",
                }}
              >
                {new Date(soporte.created_at).toLocaleString(
                  "es-AR"
                )}
              </p>

              <div style={{ marginTop: "20px" }}>
  <label
    style={{
      display: "block",
      color: "white",
      fontWeight: "bold",
      marginBottom: "8px",
    }}
  >
    Observaciones
  </label>

  <textarea
    defaultValue={soporte.observaciones || ""}
    placeholder="Anotá aquí lo que hables con el usuario..."
    rows={4}
    id={`observaciones-soporte-${soporte.id}`}
    style={{
      width: "100%",
      boxSizing: "border-box",
      padding: "12px",
      borderRadius: "8px",
      border: "1px solid #333",
      background: "#222",
      color: "white",
      fontSize: "15px",
      resize: "vertical",
    }}
  />

  <button
    onClick={() => {
      const textarea = document.getElementById(
        `observaciones-soporte-${soporte.id}`
      ) as HTMLTextAreaElement;

      guardarObservacionesSoporte(
        soporte.id,
        textarea.value
      );
    }}
    style={{
      marginTop: "10px",
      padding: "10px 16px",
      borderRadius: "8px",
      border: "none",
      background: "#FF7A00",
      color: "white",
      fontWeight: "bold",
      cursor: "pointer",
    }}
  >
    Guardar observaciones
  </button>
</div>

            </div>
          ))}

        </div>
      )}
    </div>
  );
}