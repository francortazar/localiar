"use client";

import { useEffect, useState } from "react";
import PaymentsTable from "../components/PaymentsTable";
import PaymentSummary from "../components/PaymentSummary";
import PaymentFilters from "../components/PaymentFilters";
import { supabase } from "../../lib/supabase";
import * as XLSX from "xlsx";

export default function PagosReservasPage() {

    const [pagos, setPagos] = useState<any[]>([]);
    
    const [fechaDesde, setFechaDesde] = useState("");
const [fechaHasta, setFechaHasta] = useState("");

const pagosFiltrados = pagos.filter((pago) => {
  const fechaPago = pago.created_at.split("T")[0];

  if (
    fechaDesde &&
    fechaPago < fechaDesde
  ) {
    return false;
  }

  if (
    fechaHasta &&
    fechaPago > fechaHasta
  ) {
    return false;
  }

  return true;
});

function exportarExcel() {

  const datos = pagosFiltrados.map((pago) => {

    const precioBase =
      Number(pago.amount || 0) / 1.075;

    const cobraPropietario =
      precioBase * 0.925;

    const comisionLocaliar =
      Number(pago.amount || 0) -
      cobraPropietario;

    return {
      Fecha:
        new Date(
          pago.created_at
        ).toLocaleString("es-AR"),

      "Monto cobrado":
        Number(pago.amount || 0),

      "Método de pago":
        pago.payment_method,

      Usuario:
        pago.tenant?.nombre || "",

      Propietario:
        pago.owner?.nombre || "",

      Publicación:
        pago.publications?.titulo || "",

      "Comisión Localiar":
        Math.round(comisionLocaliar),
    };
  });


  const hoja =
    XLSX.utils.json_to_sheet(datos);


  const libro =
    XLSX.utils.book_new();


  XLSX.utils.book_append_sheet(
    libro,
    hoja,
    "Pagos"
  );


  XLSX.writeFile(
    libro,
    "pagos_localiar.xlsx"
  );
}

    useEffect(() => {
  cargarPagos();
}, []);

async function cargarPagos() {
  const { data, error } = await supabase
    .from("reservation_payments")
    .select(`
  *,
  tenant:profiles!tenant_id(
    nombre
  ),
  owner:profiles!owner_id(
    nombre
  ),
  publications(
    titulo
  )
`)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "Error cargando pagos:",
      error
    );
    return;
  }

  setPagos(data || []);
}

  return (
    <main
      style={{
        background: "#050505",
        minHeight: "100vh",
        color: "white",
        padding: "20px",
      }}
    >
      <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
    flexWrap: "wrap",
    gap: "15px",
  }}
>
  <h1
    style={{
      color: "#FF7A00",
      margin: 0,
    }}
  >
    Pagos por reservas
  </h1>

  <button
  onClick={exportarExcel}
  style={{
    background: "#FF7A00",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "10px 18px",
    cursor: "pointer",
    fontWeight: "bold",
  }}
>
  Exportar Excel
</button>
</div>

<button
  onClick={() => (window.location.href = "/admin")}
  style={{
    background: "transparent",
    color: "#FF7A00",
    border: "1px solid #FF7A00",
    borderRadius: "8px",
    padding: "8px 14px",
    cursor: "pointer",
    marginBottom: "25px",
  }}
>
  ← Volver a Administración
</button>

<PaymentSummary pagos={pagosFiltrados} />

<PaymentFilters
  fechaDesde={fechaDesde}
  setFechaDesde={setFechaDesde}
  fechaHasta={fechaHasta}
  setFechaHasta={setFechaHasta}
/>

<PaymentsTable pagos={pagosFiltrados} />
    </main>
  );
}