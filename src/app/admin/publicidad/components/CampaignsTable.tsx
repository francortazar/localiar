"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import UploadBanner from "./UploadBanner";

export default function CampaignsTable() {

const estiloCabecera = {
  padding: "12px 15px",
  borderBottom: "1px solid #555",
  borderRight: "1px solid #333",
};

const estiloCelda = {
  padding: "12px 15px",
  borderBottom: "1px solid #333",
  borderRight: "1px solid #333",
};

  function mostrarFecha(fecha: string | null) {
  if (!fecha) {
    return "-";
  }

  return new Date(fecha).toLocaleDateString("es-AR");
}

  function obtenerSegmentacion(campaña: any) {
  const categorias = campaña.campaign_categories || [];
  const provincias = campaña.campaign_provinces || [];

  const todasCategorias = categorias.some(
    (item: any) => item.is_all
  );

  const todasProvincias = provincias.some(
    (item: any) => item.is_all
  );

  let textoCategorias = todasCategorias
    ? "Todas las categorías"
    : categorias
        .map((item: any) => item.categories?.nombre)
        .filter(Boolean)
        .join(", ");

  let textoProvincias = todasProvincias
    ? "Todas las provincias"
    : provincias
        .map((item: any) => item.provinces?.nombre)
        .filter(Boolean)
        .join(", ");

  return `${textoCategorias} / ${textoProvincias}`;
}

function obtenerNombrePlan(plan: string) {
  switch (plan) {
    case "monthly":
      return "Mensual";

    case "quarterly":
      return "Trimestral";

    case "yearly":
      return "Anual";

    default:
      return plan;
  }
}

function obtenerTipoCampaña(campaña: any) {
  const categorias = campaña.campaign_categories || [];
  const provincias = campaña.campaign_provinces || [];

  const todasCategorias = categorias.some(
    (item: any) => item.is_all
  );

  const todasProvincias = provincias.some(
    (item: any) => item.is_all
  );

  if (todasCategorias && todasProvincias) {
    return "🌎 General";
  }

  if (!todasCategorias && todasProvincias) {
    return "🎯 Categorías";
  }

  if (todasCategorias && !todasProvincias) {
    return "📍 Provincias";
  }

  return "🎯📍 Mixta";
}
  const [campañas, setCampañas] = useState<any[]>([]);

  const [busquedaCampaña, setBusquedaCampaña] = useState("");

const [busquedaEmpresa, setBusquedaEmpresa] = useState("");

const [filtroTipo, setFiltroTipo] = useState("all");

const [filtroPlan, setFiltroPlan] = useState("all");

const [filtroEstado, setFiltroEstado] = useState("all");

const [ordenVencimiento, setOrdenVencimiento] = useState("none");

  useEffect(() => {
    cargarCampañas();
  }, []);

  function obtenerEstado(status: string) {
  switch (status) {
    case "pending":
      return "🟡 Pendiente";

    case "processing":
      return "🟠 En proceso";

    case "active":
      return "🟢 Activa";

    case "expired":
      return "🔴 Expirada";

    default:
      return status;
  }
}

  async function cargarCampañas() {
    const { data, error } = await supabase
  .from("advertising_campaigns")
  .select(`
    *,
    campaign_categories (
      is_all,
      categories (
        nombre
      )
    ),
    campaign_provinces (
      is_all,
      provinces (
        nombre
      )
    )
  `)
  .order("created_at", {
    ascending: false,
  });

    if (error) {
      console.error("Error cargando campañas:", error);
      return;
    }

    setCampañas(data || []);
    console.log("CAMPAÑAS:", data);
  }

  async function cambiarEstado(
  id: string,
  nuevoEstado: string
)


{
  const { error } = await supabase
    .from("advertising_campaigns")
    .update({
      status: nuevoEstado,
    })
    .eq("id", id);

  if (error) {
    console.error(
      "Error cambiando estado:",
      error
    );
    return;
  }

  cargarCampañas();
}

async function activarCampaña(campaña: any) {

  if (!campaña.banner_url) {
  alert("Primero debes subir el banner de la campaña");
  return;
}

if (campaña.status !== "processing") {
  alert("La campaña no está lista para activarse");
  return;
}

  const ahora = new Date();

  let fechaFin = new Date(ahora);

  if (campaña.plan === "monthly") {
    fechaFin.setMonth(
      fechaFin.getMonth() + 1
    );
  }

  if (campaña.plan === "quarterly") {
    fechaFin.setMonth(
      fechaFin.getMonth() + 3
    );
  }

  if (campaña.plan === "yearly") {
    fechaFin.setFullYear(
      fechaFin.getFullYear() + 1
    );
  }


  const { error } = await supabase
    .from("advertising_campaigns")
    .update({
      status: "active",
      activated_at: ahora.toISOString(),
      starts_at: ahora.toISOString(),
      ends_at: fechaFin.toISOString(),
    })
    .eq("id", campaña.id);


  if (error) {
    console.error(
      "Error activando campaña:",
      error
    );
    return;
  }


  cargarCampañas();
}

const campañasFiltradas = campañas.filter((campaña) => {

 const coincideCampaña =
  (campaña.campaign_name || "")
    .toLowerCase()
    .includes(
      busquedaCampaña.toLowerCase()
    );

const coincideEmpresa =
  (campaña.company_name || "")
    .toLowerCase()
    .includes(
      busquedaEmpresa.toLowerCase()
    );

  const coincidePlan =
    filtroPlan === "all" ||
    campaña.plan === filtroPlan;

  const coincideEstado =
    filtroEstado === "all" ||
    campaña.status === filtroEstado;

  const tipo = obtenerTipoCampaña(campaña);

  const coincideTipo =
    filtroTipo === "all" ||
    (filtroTipo === "general" && tipo === "🌎 General") ||
    (filtroTipo === "categories" && tipo === "🎯 Categorías") ||
    (filtroTipo === "provinces" && tipo === "📍 Provincias") ||
    (filtroTipo === "mixed" && tipo === "🎯📍 Mixta");

  return (
  coincideCampaña &&
  coincideEmpresa &&
  coincidePlan &&
  coincideEstado &&
  coincideTipo 
);

});

const campañasOrdenadas = [...campañasFiltradas].sort((a,b)=>{

  if (ordenVencimiento === "asc") {

    if (!a.ends_at) return 1;
    if (!b.ends_at) return -1;

    return (
      new Date(a.ends_at).getTime()
      -
      new Date(b.ends_at).getTime()
    );
  }


  if (ordenVencimiento === "desc") {

    if (!a.ends_at) return 1;
    if (!b.ends_at) return -1;

    return (
      new Date(b.ends_at).getTime()
      -
      new Date(a.ends_at).getTime()
    );
  }


  return 0;

});

const estiloSelect = {
  padding: "8px",
  borderRadius: "6px",
  border: "1px solid #555",
  background: "#111",
  color: "#FFFFFF",
  width: "100%",
};

  return (
    <div
      style={{
        marginTop: "30px",
        padding: "20px",
        borderRadius: "10px",
        background: "#1f1f1f",
        border: "1px solid #333",
      }}
    >
      <h2
        style={{
          marginTop: 0,
          color: "#FFFFFF",
        }}
      >
        📋 Campañas publicitarias
      </h2>

     

      <table
  style={{
    width: "100%",
    borderCollapse: "collapse",
    color: "#FFFFFF",
  }}
>
  <thead>
  <tr>
    <th
  style={{
    ...estiloCabecera,
    textAlign: "left",
  }}
>
      Campaña
    </th>

    <th
  style={{
    ...estiloCabecera,
    textAlign: "left",
  }}
>
  Empresa
</th>

    <th
  style={{
    ...estiloCabecera,
    textAlign: "left",
  }}
>
  Contacto
</th>

<th
  style={{
    ...estiloCabecera,
    textAlign: "left",
  }}
>
  Teléfono
</th>

<th
  style={{
    ...estiloCabecera,
    textAlign: "left",
  }}
>
  Descripción
</th>

<th
  style={{
    ...estiloCabecera,
    textAlign: "left",
  }}
>
  Banner
</th>

    <th
  style={{
    ...estiloCabecera,
    textAlign: "left",
  }}
>
      Segmentación
    </th>

    <th
  style={{
    ...estiloCabecera,
    textAlign: "left",
  }}
>
      Tipo
    </th>

    <th
  style={{
    ...estiloCabecera,
    textAlign: "left",
  }}
>
      Plan
    </th>

    <th
  style={{
    ...estiloCabecera,
    textAlign: "left",
  }}
>
      Precio
    </th>

    <th
  style={{
    ...estiloCabecera,
    textAlign: "left",
  }}
>
      Estado
    </th>

    <th
  style={{
    ...estiloCabecera,
    textAlign: "left",
  }}
>
  Vencimiento
</th>

    <th
  style={{
    ...estiloCabecera,
    textAlign: "left",
  }}
>
  Acciones
</th>
  </tr>

<tr>

  <td
  style={{
    ...estiloCelda,
  }}
>
    <input
  placeholder="Buscar campaña..."
  value={busquedaCampaña}
  onChange={(e) =>
    setBusquedaCampaña(e.target.value)
  }
  style={{
    width: "100%",
    padding: "8px",
    borderRadius: "6px",
    border: "1px solid #555",
    background: "#111",
    color: "#fff",
  }}
/>
  </td>

  <td
  style={{
    ...estiloCelda,
  }}
>
  <input
    placeholder="Buscar empresa..."
    value={busquedaEmpresa}
    onChange={(e) =>
      setBusquedaEmpresa(e.target.value)
    }
    style={{
      width: "100%",
      padding: "8px",
      borderRadius: "6px",
      border: "1px solid #555",
      background: "#111",
      color: "#fff",
    }}
  />
</td>
<td></td>

<td></td>

<td></td>

<td></td>

<td></td>

<td>
  <select
    value={filtroTipo}
      onChange={(e) => setFiltroTipo(e.target.value)}
      style={estiloSelect}
    >
      <option value="all">Todos</option>
      <option value="general">General</option>
      <option value="categories">Categorías</option>
      <option value="provinces">Provincias</option>
      <option value="mixed">Mixta</option>
    </select>
  </td>

  <td>
    <select
      value={filtroPlan}
      onChange={(e) => setFiltroPlan(e.target.value)}
      style={estiloSelect}
    >
      <option value="all">Todos</option>
      <option value="monthly">Mensual</option>
      <option value="quarterly">Trimestral</option>
      <option value="yearly">Anual</option>
    </select>
  </td>

  <td></td>

  <td>
    <select
      value={filtroEstado}
      onChange={(e) => setFiltroEstado(e.target.value)}
      style={estiloSelect}
    >
      <option value="all">Todos</option>
      <option value="pending">Pendiente</option>
      <option value="processing">En proceso</option>
      <option value="active">Activa</option>
      <option value="expired">Expirada</option>
    </select>
  </td>

  <td>
    <select
      value={ordenVencimiento}
      onChange={(e) => setOrdenVencimiento(e.target.value)}
      style={estiloSelect}
    >
      <option value="none">Sin ordenar</option>
      <option value="asc">Próximos primero</option>
      <option value="desc">Más lejanos primero</option>
    </select>
  </td>

  <td></td>

</tr>

</thead>

  <tbody>
    {campañasOrdenadas.map((campaña) => (
      <tr key={campaña.id}>
        <td
  style={{
    ...estiloCelda,
  }}
>
  {campaña.campaign_name || "-"}
</td>

<td
  style={{
    ...estiloCelda,
  }}
>
  {campaña.company_name}
</td>
        <td
  style={{
    ...estiloCelda,
  }}
>
  {campaña.contact_name || "-"}
</td>

<td
  style={{
    ...estiloCelda,
    whiteSpace: "nowrap",
  }}
>
  {campaña.phone || "-"}
</td>

<td
  style={{
    ...estiloCelda,
    maxWidth: "250px",
  }}
>
  {campaña.description || "-"}
</td>

<td
  style={{
    padding: "12px 15px",
  }}
>
  {campaña.banner_url ? (
    <a
      href={campaña.banner_url}
      target="_blank"
      style={{
        color:"#4CAF50",
      }}
    >
      🖼️ Ver
    </a>
  ) : (
    "⚠️ Pendiente"
  )}
</td>

        <td
  style={{
    ...estiloCelda,
    maxWidth: "300px",
  }}
>
          {obtenerSegmentacion(campaña)}
        </td>

        <td
  style={{
    ...estiloCelda,
  }}
>
  {obtenerTipoCampaña(campaña)}
</td>

        <td
  style={{
    ...estiloCelda,
  }}
>
  {obtenerNombrePlan(campaña.plan)}
</td>

        <td
  style={{
    ...estiloCelda,
    textAlign: "right",
  }}
>
  {campaña.agreed_price}
</td>

        <td
  style={{
    ...estiloCelda,
  }}
>
  {obtenerEstado(campaña.status)}
</td>

        <td
  style={{
    ...estiloCelda,
  }}
>
  {mostrarFecha(campaña.ends_at)}
</td>

       <td
  style={{
    ...estiloCelda,
    textAlign: "center",
  }}
>
  {campaña.status === "pending" && (
    <>
      <button
  onClick={() => {
    const numero = campaña.phone?.replace(/\D/g, "");

    if (!numero) {
      alert("La campaña no tiene teléfono cargado");
      return;
    }

    const nombre = campaña.contact_name || "cliente";
    const empresa = campaña.company_name || "su empresa";

    const mensaje = 
`Hola ${nombre}, soy Francisco Cortazar CEO de Localiar S.A.
Me comunico para seguir la conversación sobre la oportunidad de que ${empresa} publicite en Localiar.`;

    const mensajeCodificado = encodeURIComponent(mensaje);

    window.open(
      `https://wa.me/54${numero}?text=${mensajeCodificado}`,
      "_blank"
    );
  }}
  style={{
    marginRight: "8px",
    padding: "6px 10px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    background: "#25D366",
    color: "#fff",
  }}
>
  📲 WhatsApp
</button>

      <button
  onClick={() =>
    cambiarEstado(
      campaña.id,
      "processing"
    )
  }
  style={{
    padding: "6px 10px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    background: "#FF7A00",
    color: "#fff",
  }}
>
  ➡️ Proceso
</button>
    </>
  )}

  {campaña.status === "processing" && (
    <>
      <UploadBanner
  campañaId={campaña.id}
  onUploaded={() => cargarCampañas()}
/>

      <button
  onClick={() =>
    activarCampaña(campaña)
  }
  style={{
    padding: "6px 10px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    background: "#4CAF50",
    color: "#fff",
  }}
>
  🟢 Activar
</button>
    </>
  )}

 {campaña.status === "active" && (
  <button
    onClick={() =>
      cambiarEstado(
        campaña.id,
        "expired"
      )
    }
    style={{
      padding: "6px 10px",
      borderRadius: "6px",
      border: "none",
      cursor: "pointer",
      background: "#d32f2f",
      color: "#fff",
    }}
  >
    🔴 Baja
  </button>
)}

  {campaña.status === "expired" && (
  <button
    onClick={() =>
      cambiarEstado(
        campaña.id,
        "pending"
      )
    }
    style={{
      padding: "6px 10px",
      borderRadius: "6px",
      border: "none",
      cursor: "pointer",
      background: "#2196F3",
      color: "#fff",
    }}
  >
    🔄 Renovar
  </button>
)}
</td>
      </tr>
    ))}
  </tbody>
</table>
    </div>
  );
}