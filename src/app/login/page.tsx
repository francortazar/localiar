"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  async function ingresar() {
    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Login correcto");
router.push("/");
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
        Iniciar sesión
      </h1>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          maxWidth: "500px",
        }}
      >
        <input
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          style={inputStyle}
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          style={inputStyle}
        />

        <button
          onClick={ingresar}
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
          Ingresar
        </button>

        <Link
  href="/registro"
  style={{
    textAlign: "center",
    color: "#FF7A00",
    textDecoration: "none",
    marginTop: "10px",
    fontWeight: "bold",
  }}
>
  ¿No tenés cuenta? Registrate
</Link>
      </div>
    </main>
  );
}

const inputStyle = {
  padding: "12px",
  borderRadius: "10px",
  border: "none",
};