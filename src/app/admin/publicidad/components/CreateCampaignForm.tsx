"use client";

import { useState } from "react";
import FormInput from "../../components/FormInput";
import { useEffect } from "react";
import MultiSelect from "../../components/MultiSelect";
import { obtenerCategorias } from "../../../lib/categories";
import { obtenerProvincias } from "../../../lib/provinces";
import FormSelect from "../../components/FormSelect";
import FormTextarea from "../../components/FormTextarea";
import { supabase } from "../../../lib/supabase";

export default function CreateCampaignForm() {

    const [mensajeExito, setMensajeExito] = useState("");

    const [form, setForm] = useState({
  campaign_name: "",
  company_name: "",
  contact_name: "",
  phone: "",
  email: "",
  plan: "monthly",
  agreed_price: "",
  link_type: "web",
  link_url: "",
  description: "",
});

const [categorias, setCategorias] = useState<any[]>([]);
const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState<string[]>([]);
const [provincias, setProvincias] = useState<any[]>([]);
const [provinciasSeleccionadas, setProvinciasSeleccionadas] = useState<string[]>([]);

useEffect(() => {
  async function cargarDatos() {
    const categorias = await obtenerCategorias();
    const provincias = await obtenerProvincias();

    setCategorias(categorias);
    setProvincias(provincias);
  }

  cargarDatos();
}, []);

async function guardarCampaña() {
  const { data, error } = await supabase
    .from("advertising_campaigns")
    .insert({
      campaign_name: form.campaign_name,
      company_name: form.company_name,
      contact_name: form.contact_name,
      phone: form.phone,
      email: form.email,
      plan: form.plan,
      agreed_price: Number(form.agreed_price),
      link_type: form.link_type,
      link_url: form.link_url,
      description: form.description,
    })
    .select()
    .single();

  if (error) {
    console.error("Error guardando campaña:", error);
    return;
  }

console.log("Campaña creada:", data);


// Guardar categorías
if (categoriasSeleccionadas.includes("__ALL__")) {
  await supabase
    .from("campaign_categories")
    .insert({
      campaign_id: data.id,
      is_all: true,
    });
} else {
  const categoriasInsert = categoriasSeleccionadas.map((id) => ({
    campaign_id: data.id,
    category_id: id,
    is_all: false,
  }));

  if (categoriasInsert.length > 0) {
    await supabase
      .from("campaign_categories")
      .insert(categoriasInsert);
  }
}


// Guardar provincias
if (provinciasSeleccionadas.includes("__ALL__")) {
  await supabase
    .from("campaign_provinces")
    .insert({
      campaign_id: data.id,
      is_all: true,
    });
} else {
  const provinciasInsert = provinciasSeleccionadas.map((id) => ({
    campaign_id: data.id,
    province_id: id,
    is_all: false,
  }));

  if (provinciasInsert.length > 0) {
    await supabase
      .from("campaign_provinces")
      .insert(provinciasInsert);
  }
}


setMensajeExito("✅ Campaña creada correctamente");
}

function obtenerTipoCampaña() {
  const todasCategorias = categoriasSeleccionadas.includes("__ALL__");
  const todasProvincias = provinciasSeleccionadas.includes("__ALL__");

  const hayCategorias =
    todasCategorias || categoriasSeleccionadas.length > 0;

  const hayProvincias =
    todasProvincias || provinciasSeleccionadas.length > 0;

  if (!hayCategorias || !hayProvincias) {
    return "⚪ Definí la segmentación de la campaña";
  }

  if (todasCategorias && todasProvincias) {
    return "🌎 General";
  }

  if (!todasCategorias && todasProvincias) {
    return "🎯 Segmentada por categorías";
  }

  if (todasCategorias && !todasProvincias) {
    return "📍 Segmentada por provincias";
  }

  return "🎯📍 Segmentada por categorías y provincias";
}

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
        ➕ Nueva campaña publicitaria
      </h2>

      <div
  style={{
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "15px",
    marginTop: "20px",
  }}
>

<FormInput
  placeholder="Nombre de la campaña"
  value={form.campaign_name}
  onChange={(value) =>
    setForm({
      ...form,
      campaign_name: value,
    })
  }
/>

  <FormInput
  placeholder="Empresa"
  value={form.company_name}
  onChange={(value) =>
    setForm({
      ...form,
      company_name: value,
    })
  }
/>

  <FormInput
  placeholder="Contacto"
  value={form.contact_name}
  onChange={(value) =>
    setForm({
      ...form,
      contact_name: value,
    })
  }
/>

  <FormInput
  placeholder="Teléfono"
  value={form.phone}
  onChange={(value) =>
    setForm({
      ...form,
      phone: value,
    })
  }
/>

  <FormInput
  placeholder="Email"
  value={form.email}
  onChange={(value) =>
    setForm({
      ...form,
      email: value,
    })
  }
/>
</div>

<div
  style={{
    marginTop: "30px",
  }}
>
  <MultiSelect
  title="Categorías"
  options={categorias}
  selected={categoriasSeleccionadas}
  onChange={setCategoriasSeleccionadas}
  allowAll
/>
</div>

<div
  style={{
    marginTop: "25px",
  }}
>
  <MultiSelect
  title="Provincias"
  options={provincias}
  selected={provinciasSeleccionadas}
  onChange={setProvinciasSeleccionadas}
  allowAll
/>
</div>

<div
  style={{
    marginTop: "25px",
    padding: "18px",
    borderRadius: "10px",
    background: "#161616",
    border: "1px solid #333",
  }}
>
  <div
    style={{
      color: "#888",
      fontSize: "13px",
      marginBottom: "8px",
    }}
  >
    Tipo de campaña
  </div>

  <div
    style={{
      color: "#FFFFFF",
      fontSize: "18px",
      fontWeight: "bold",
    }}
  >
    {obtenerTipoCampaña()}
  </div>
</div>

<div
  style={{
    marginTop: "30px",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "15px",
  }}
>
  <FormSelect
    value={form.plan}
    onChange={(value) =>
      setForm({
        ...form,
        plan: value,
      })
    }
    options={[
      { value: "monthly", label: "Mensual" },
      { value: "quarterly", label: "Trimestral" },
      { value: "yearly", label: "Anual" },
    ]}
  />

  <FormInput
    placeholder="Precio acordado"
    value={form.agreed_price}
    onChange={(value) =>
      setForm({
        ...form,
        agreed_price: value,
      })
    }
  />
</div>

<div
  style={{
    marginTop: "20px",
    display: "grid",
    gridTemplateColumns: "1fr 2fr",
    gap: "15px",
  }}
>
  <FormSelect
    value={form.link_type}
    onChange={(value) =>
      setForm({
        ...form,
        link_type: value,
      })
    }
    options={[
      { value: "web", label: "Sitio web" },
      { value: "whatsapp", label: "WhatsApp" },
      { value: "instagram", label: "Instagram" },
    ]}
  />

  <FormInput
    placeholder="Enlace"
    value={form.link_url}
    onChange={(value) =>
      setForm({
        ...form,
        link_url: value,
      })
    }
  />
</div>

<div
  style={{
    marginTop: "25px",
  }}
>
  <FormTextarea
    placeholder="Descripción de la publicidad"
    value={form.description}
    onChange={(value) =>
      setForm({
        ...form,
        description: value,
      })
    }
    rows={5}
  />
</div>

<div
  style={{
    marginTop: "30px",
    display: "flex",
    justifyContent: "flex-end",
  }}
>
  <button
    type="button"
    onClick={guardarCampaña}
    style={{
      background: "#FF7A00",
      color: "#FFFFFF",
      border: "none",
      padding: "12px 24px",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "bold",
    }}
  >
    Guardar campaña
  </button>

  {mensajeExito && (
  <div
    style={{
      marginTop: "20px",
      padding: "12px",
      borderRadius: "8px",
      background: "#123d20",
      border: "1px solid #2ecc71",
      color: "#2ecc71",
      fontWeight: "bold",
      textAlign: "center",
    }}
  >
    {mensajeExito}
  </div>
)}
</div>

</div>

    
  );
}