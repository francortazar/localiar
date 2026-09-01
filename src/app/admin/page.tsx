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
          title="Garantías y cancelaciones"
          description="Administrar pagos, depósitos de garantía y liberaciones."
          href="/admin/pagos"
        />

        <AdminCard
  icon="💰"
  title="Pagos por reservas"
  description="Visualizar cobros realizados por reservas y movimientos económicos."
  href="/admin/pagos-reservas"
/>

<AdminCard
  icon="🏦"
  title="Pagos a propietarios"
  description="Transferencias pendientes e historial de pagos realizados a propietarios."
  href="/admin/pagos-propietarios"
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
  icon="⏰"
  title="Publicaciones vencidas"
  description="Publicaciones que ya no tienen fechas disponibles para alquilar."
  href="/admin/publicaciones-vencidas"
/>

        <AdminCard
          icon="⭐"
          title="Valoraciones"
          description="Revisar y moderar opiniones."
          href="/admin/valoraciones"
        />

        <AdminCard
          icon="🚩"
          title="Centro de herramientas"
          description="Pruebas, utilidades internas y herramientas de desarrollo para la administración de Localiar."
          href="/admin/herramientas"
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

<AdminCard
  icon="🔔"
  title="Notificaciones"
  description="Solicitudes y avisos pendientes de atención."
  href="/admin/notificaciones"
/>
      </div>
    </>
  );
}