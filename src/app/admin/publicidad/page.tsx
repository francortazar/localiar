"use client";

import { useRouter } from "next/navigation";
import CreateCampaignForm from "./components/CreateCampaignForm";
import CampaignsTable from "./components/CampaignsTable";

export default function PublicidadPage() {
  const router = useRouter();

  return (
    <div>
      <button
        onClick={() => router.push("/admin")}
        style={{
          marginBottom: "20px",
          padding: "10px 16px",
          borderRadius: "8px",
          border: "none",
          cursor: "pointer",
          background: "#333",
          color: "#FFFFFF",
        }}
      >
        ← Volver al Centro de Operaciones
      </button>

      <h1
        style={{
          color: "#FFFFFF",
          marginBottom: "20px",
        }}
      >
        📢 Publicidad
      </h1>

      <p
        style={{
          color: "#999",
        }}
      >
        Administración de campañas publicitarias. 1200 × 480 px tamaño del banner
      </p>

      <CreateCampaignForm />
      <CampaignsTable />
    </div>
  );
}