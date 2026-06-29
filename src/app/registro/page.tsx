"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function RegistroPage() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [telefono, setTelefono] = useState("");
const [provincia, setProvincia] = useState("");

  async function registrar() {
    if (
  !nombre ||
  !telefono ||
  !provincia ||
  !email ||
  !password
) {
  alert("Completá todos los campos");
  return;
}
    const { data, error } =
      await supabase.auth.signUp({
        email,
        password,
        options: {
  data: {
    nombre,
    telefono,
    provincia,
  },
},
      });

    if (error) {
      alert(error.message);
      return;
    }
    const user = data.user;

if (!user) {
  alert("No se pudo crear el usuario");
  return;
}

const { error: profileError } =
  await supabase
  .from("profiles")
  .insert([
    {
      id: user.id,
      nombre,
      email,
      telefono,
      provincia,
    },
  ]);

if (profileError) {
  alert(profileError.message);
  return;
}

    alert("Usuario creado correctamente");

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
        Crear cuenta
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
          placeholder="Nombre completo"
          value={nombre}
          onChange={(e) =>
            setNombre(e.target.value)
          }
          style={inputStyle}
        />
        <input
  placeholder="Teléfono"
  value={telefono}
  onChange={(e) =>
    setTelefono(e.target.value)
  }
  style={inputStyle}
/>
<select
  value={provincia}
  onChange={(e) =>
    setProvincia(e.target.value)
  }
  style={{
    ...inputStyle,
    color: "black",
    background: "white",
  }}
>
  <option value="">
    Seleccionar provincia
  </option>

  <option>Buenos Aires</option>
  <option>CABA</option>
  <option>Catamarca</option>
  <option>Chaco</option>
  <option>Chubut</option>
  <option>Córdoba</option>
  <option>Corrientes</option>
  <option>Entre Ríos</option>
  <option>Formosa</option>
  <option>Jujuy</option>
  <option>La Pampa</option>
  <option>La Rioja</option>
  <option>Mendoza</option>
  <option>Misiones</option>
  <option>Neuquén</option>
  <option>Río Negro</option>
  <option>Salta</option>
  <option>San Juan</option>
  <option>San Luis</option>
  <option>Santa Cruz</option>
  <option>Santa Fe</option>
  <option>Santiago del Estero</option>
  <option>Tierra del Fuego</option>
  <option>Tucumán</option>
</select>

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
          onClick={registrar}
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
          Registrarme
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