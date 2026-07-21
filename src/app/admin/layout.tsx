"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/app/lib/supabase";
import AdminHeader from "./components/AdminHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [nombre, setNombre] = useState("");

  useEffect(() => {
    verificarAcceso();
  }, []);

  async function verificarAcceso() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/login");
      return;
    }

    const { data } = await supabase
  .from("profiles")
  .select("nombre, es_admin")
  .eq("id", user.id)
  .single();

    if (!data?.es_admin) {
      router.replace("/perfil");
      return;
    }

    setNombre(data.nombre);

    setLoading(false);
  }

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#0D1F3D",
          color: "white",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        Verificando permisos...
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0D1F3D",
        color: "white",
      }}
    >
      <header
        style={{
          height: "70px",
          background: "#111111",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 20px",
          borderBottom: "1px solid rgba(255,255,255,.1)",
        }}
      >
        <h2
          style={{
            color: "#FF7A00",
            margin: 0,
          }}
        >
          🛡 Localiar Admin
        </h2>

        <Link
          href="/perfil"
          style={{
            color: "white",
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          👤 Volver al Perfil
        </Link>
      </header>

      <div
  style={{
    padding: "25px",
  }}
>
  <AdminHeader nombre={nombre} />

  {children}
</div>
    </main>
  );
}