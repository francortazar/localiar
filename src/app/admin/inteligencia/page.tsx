"use client";



import { useRouter } from "next/navigation";
import { useDashboardStats } from "./hooks/useDashboardStats";
import SummaryCards from "./components/SummaryCards";
import CategoryInterestTable from "./components/CategoryInterestTable";
import ProvinceInterestTable from "./components/ProvinceInterestTable";
import MarketSegmentsTable from "./components/MarketSegmentsTable";


export default function InteligenciaPage() {
  const router = useRouter();
  const {
  totalViews,
  categoryStats,
  provinceStats,
  marketSegments,
} = useDashboardStats();

  

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
        📊 Estadísticas de Localiar
      </h1>

      <p
        style={{
          color: "#999",
        }}
      >
        Panel de análisis e inteligencia de datos.
      </p>

      <SummaryCards totalViews={totalViews} />
      <CategoryInterestTable data={categoryStats} />
      <ProvinceInterestTable data={provinceStats} />
      <MarketSegmentsTable data={marketSegments} />
    </div>
  );
}