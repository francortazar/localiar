"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function EditarPerfilPage() {
  const [usuario, setUsuario] = useState<any>(null);
  const [guardando, setGuardando] = useState(false);
  const [provincias, setProvincias] = useState<any[]>([]);

  useEffect(() => {
    async function cargarPerfil() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.log(error);
        return;
      }

      setUsuario(data);

      const { data: provinciasData, error: provinciasError } =
  await supabase
    .from("provinces")
    .select("*")
    .eq("activo", true)
    .order("nombre");

if (provinciasError) {
  console.log(provinciasError);
  return;
}

setProvincias(provinciasData || []);
    }

    cargarPerfil();
  }, []);

  async function guardarCambios() {
    setGuardando(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        email: usuario.email,
        telefono: usuario.telefono,
        provincia: usuario.provincia,
        alias_pago: usuario.alias_pago,
      })
      .eq("id", usuario.id);

    setGuardando(false);

    if (error) {
      console.log(error);
      alert("Error al guardar los cambios");
      return;
    }

    window.location.href = "/perfil";
  }

  if (!usuario) {
    return (
      <main
        style={{
          background: "#050505",
          minHeight: "100vh",
          color: "white",
          padding: "20px",
        }}
      >
        Cargando...
      </main>
    );
  }

 return (
  <main
    style={{
      background: "#050505",
      minHeight: "100vh",
      color: "white",
      padding: "30px 20px",
      display: "flex",
      justifyContent: "center",
    }}
  >
    <div
      style={{
        width: "100%",
        maxWidth: "500px",
      }}
    >
      <h1
        style={{
          fontSize: "28px",
          marginBottom: "25px",
        }}
      >
        Editar perfil
      </h1>

      <div
        style={{
          background: "#111",
          borderRadius: "16px",
          padding: "25px",
          boxShadow: "0 0 20px rgba(255,255,255,0.05)",
          display: "flex",
          flexDirection: "column",
          gap: "18px",
        }}
      >

        <div>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              color: "#aaa",
              fontSize: "14px",
            }}
          >
            Nombre
          </label>

          <input
            value={usuario.nombre}
            disabled
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "10px",
              border: "1px solid #333",
              background: "#1a1a1a",
              color: "#777",
            }}
          />
        </div>


        <div>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              color: "#aaa",
              fontSize: "14px",
            }}
          >
            Email
          </label>

          <input
  value={usuario.email || ""}
  disabled
  style={{
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #333",
    background: "#1a1a1a",
    color: "#777",
  }}
/>
        </div>


        <div>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              color: "#aaa",
              fontSize: "14px",
            }}
          >
            Teléfono
          </label>

          <input
            value={usuario.telefono}
            onChange={(e) =>
              setUsuario({
                ...usuario,
                telefono: e.target.value,
              })
            }
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "10px",
              border: "1px solid #333",
              background: "#050505",
              color: "white",
            }}
          />
        </div>


        <div>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              color: "#aaa",
              fontSize: "14px",
            }}
          >
            Provincia
          </label>

          <select
  value={usuario.provincia}
  onChange={(e) =>
    setUsuario({
      ...usuario,
      provincia: e.target.value,
    })
  }
  style={{
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #333",
    background: "#050505",
    color: "white",
  }}
>
  {provincias.map((provincia) => (
    <option
      key={provincia.id}
      value={provincia.nombre}
    >
      {provincia.nombre}
    </option>
  ))}
</select>
        </div>


        <div>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              color: "#aaa",
              fontSize: "14px",
            }}
          >
            Alias de pago
          </label>

          <input
            value={usuario.alias_pago || ""}
            onChange={(e) =>
              setUsuario({
                ...usuario,
                alias_pago: e.target.value,
              })
            }
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "10px",
              border: "1px solid #333",
              background: "#050505",
              color: "white",
            }}
          />
        </div>


        <button
          onClick={guardarCambios}
          disabled={guardando}
          style={{
            marginTop: "10px",
            padding: "14px",
            borderRadius: "12px",
            border: "none",
            background: "#ffffff",
            color: "#000",
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          {guardando ? "Guardando..." : "Guardar cambios"}
        </button>

      </div>
    </div>
  </main>
);
  
}