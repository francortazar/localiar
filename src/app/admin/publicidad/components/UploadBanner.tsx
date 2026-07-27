"use client";

import { useState } from "react";
import { supabase } from "../../../lib/supabase";

type Props = {
  campañaId: string;
  onUploaded: () => void;
};

export default function UploadBanner({
  campañaId,
  onUploaded,
}: Props) {

  const [subiendo, setSubiendo] = useState(false);


  async function subirBanner(
    e: React.ChangeEvent<HTMLInputElement>
  ) {

    const archivo = e.target.files?.[0];

    if (!archivo) return;


    setSubiendo(true);


    const extension =
      archivo.name.split(".").pop();


    const nombreArchivo =
      `${campañaId}-${Date.now()}.${extension}`;


    const { error: errorUpload } =
      await supabase.storage
        .from("campaign-banners")
        .upload(
          nombreArchivo,
          archivo
        );


    if (errorUpload) {
      console.error(
        "Error subiendo banner:",
        errorUpload
      );

      setSubiendo(false);
      return;
    }


    const { data } =
      supabase.storage
        .from("campaign-banners")
        .getPublicUrl(
          nombreArchivo
        );


    const urlBanner =
      data.publicUrl;


    const { error: errorUpdate } =
      await supabase
        .from("advertising_campaigns")
        .update({
          banner_url: urlBanner,
        })
        .eq(
          "id",
          campañaId
        );


    if (errorUpdate) {
      console.error(
        "Error guardando URL:",
        errorUpdate
      );

      setSubiendo(false);
      return;
    }


    setSubiendo(false);

    onUploaded();
  }


  return (
    <label
      style={{
        padding: "6px 10px",
        borderRadius: "6px",
        background: "#444",
        color: "#fff",
        cursor: "pointer",
      }}
    >

      {subiendo
        ? "Subiendo..."
        : "📤 Banner"
      }


      <input
        type="file"
        accept="image/*"
        onChange={subirBanner}
        style={{
          display: "none",
        }}
      />

    </label>
  );
}