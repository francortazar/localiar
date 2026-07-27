"use client";


import AdminCard from "./components/AdminCard";
import SystemStatus from "./components/SystemStatus";
import SectionCard from "./components/SectionCard";


export default function AdminPage() {
  return (
    <>
      
<SystemStatus
  status="ok"
  message="Todos los procesos de Localiar están funcionando correctamente."
/>
     <SectionCard title="🔴 Acciones pendientes">
  <p
    style={{
      color: "#999",
      margin: 0,
    }}
  >
    No hay acciones pendientes.
  </p>
</SectionCard>

      <h2
        style={{
          marginBottom: "20px",
          color: "#FFFFFF",
        }}
      >
        Centro de Operaciones
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "20px",
        }}
      >
        <AdminCard
          icon="💳"
          title="Pagos y Garantías"
          description="Administrar pagos, depósitos de garantía y liberaciones."
          href="/admin/pagos"
        />

        <AdminCard
          icon="📅"
          title="Reservas"
          description="Consultar y administrar todas las reservas."
          href="/admin/reservas"
        />

        <AdminCard
          icon="👥"
          title="Usuarios"
          description="Gestionar los usuarios registrados."
          href="/admin/usuarios"
        />

        <AdminCard
          icon="🏢"
          title="Publicaciones"
          description="Administrar los espacios publicados."
          href="/admin/publicaciones"
        />

        <AdminCard
          icon="⭐"
          title="Valoraciones"
          description="Revisar y moderar opiniones."
          href="/admin/valoraciones"
        />

        <AdminCard
          icon="🚩"
          title="Reportes"
          description="Gestionar denuncias y reclamos."
          href="/admin/reportes"
        />

        <AdminCard
  icon="🎯"
  title="Inteligencia de Mercado"
  description="Analizar el comportamiento de los usuarios y la segmentación comercial."
  href="/admin/inteligencia"
/>

<AdminCard
  icon="📢"
  title="Publicidad"
  description="Administrar campañas publicitarias."
  href="/admin/publicidad"
/>
      </div>
    </>
  );
}