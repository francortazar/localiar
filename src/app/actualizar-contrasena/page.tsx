"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";

export default function ActualizarContrasenaPage() {
  const [password, setPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [actualizando, setActualizando] = useState(false);
  const router = useRouter();

  async function actualizarContrasena() {
    if (!password || !confirmarPassword) {
      alert("Completá ambos campos.");
      return;
    }

    if (password !== confirmarPassword) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    if (password.length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    try {
      setActualizando(true);

      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        console.error(error);
        alert("No se pudo actualizar la contraseña.");
        return;
      }

      alert("Contraseña actualizada correctamente.");
      router.push("/login");
    } catch (error) {
      console.error(error);
      alert("Ocurrió un error al actualizar la contraseña.");
    } finally {
      setActualizando(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#050505",
        color: "white",
        padding: "20px",
      }}
    >
      <h1
        style={{
          color: "#FF7A00",
          marginBottom: "25px",
        }}
      >
        Crear nueva contraseña
      </h1>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          maxWidth: "500px",
        }}
      >
        <p style={{ color: "#ccc" }}>
          Ingresá tu nueva contraseña y confirmala para
          completar el proceso.
        </p>

        <input
          type="password"
          placeholder="Nueva contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />

        <input
          type="password"
          placeholder="Repetir nueva contraseña"
          value={confirmarPassword}
          onChange={(e) =>
            setConfirmarPassword(e.target.value)
          }
          style={inputStyle}
        />

        <button
          onClick={actualizarContrasena}
          disabled={actualizando}
          style={{
            background: "#FF7A00",
            color: "white",
            border: "none",
            borderRadius: "12px",
            padding: "14px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          {actualizando
            ? "Actualizando..."
            : "Actualizar contraseña"}
        </button>
      </div>
    </main>
  );
}

const inputStyle = {
  padding: "12px",
  borderRadius: "10px",
  border: "none",
};