"use client";

import { useEffect, useState } from "react";
import { supabase } from "../app/lib/supabase";
import {
  obtenerMercadosFavoritosUsuario,
  seleccionarPublicidadParaUsuario
} from "@/app/lib/advertisingEngine";

export default function AdvertisingBanner({
  filters,
}: {
  filters: any;
}) {

  const [campaña, setCampaña] = useState<any>(null);
  const [altoBanner, setAltoBanner] = useState(120);

useEffect(() => {

  function actualizarAltura() {

    if (window.innerWidth >= 1200) {
      setAltoBanner(160);
    }

    else if (window.innerWidth >= 768) {
      setAltoBanner(135);
    }

    else {
      setAltoBanner(120);
    }

  }

  actualizarAltura();

  window.addEventListener(
    "resize",
    actualizarAltura
  );

  cargarPublicidad();

return () =>
    window.removeEventListener(
      "resize",
      actualizarAltura
    );

}, [filters]);

console.log("FILTROS QUE LLEGAN AL BANNER:", filters);

  async function cargarPublicidad() {

  const publicidad =
    await seleccionarPublicidadParaUsuario(filters);


  console.log(
    "Publicidad seleccionada:",
    publicidad
  );


  if (publicidad) {
    setCampaña(publicidad);
  }
}

  if (!campaña) {
    return null;
  }

  return (
  <div
    style={{
      width: "100%",
      borderRadius: "16px",
      overflow: "hidden",
      background: "#111",
      boxShadow: "0 4px 15px rgba(0,0,0,0.4)",
    }}
  >
    <a
  href={
  campaña.link_type === "whatsapp"
    ? `https://wa.me/${campaña.link_url}`
    : campaña.link_url.startsWith("http")
      ? campaña.link_url
      : `https://${campaña.link_url}`
}
  target="_blank"
  rel="noopener noreferrer"
>
  <img
    src={campaña.banner_url}
    alt={campaña.campaign_name}
    style={{
      width: "100%",
      height: `${altoBanner}px`,
      objectFit: "cover",
      display: "block",
    }}
  />
</a>
  </div>
);
}