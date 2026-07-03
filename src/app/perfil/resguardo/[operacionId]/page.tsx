"use client";

import { useParams, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { supabase } from "@/app/lib/supabase";
import imageCompression from "browser-image-compression";

export default function ResguardoPage() {
  const { operacionId } = useParams();
  const router = useRouter();

  const [descargo, setDescargo] = useState("");

  const [fotos, setFotos] = useState<File[]>([]);
  const inputFotosRef = useRef<HTMLInputElement>(null);

  return (
    <main
      style={{
        background: "#050505",
        minHeight: "100vh",
        color: "white",
        padding: "20px",
      }}
    >
      <h1>Solicitud de cobro de resguardo</h1>

      <p>
        Operación: <strong>{operacionId}</strong>
      </p>

      <div style={{ marginTop: "30px" }}>
        <p>
          <strong>Describí lo ocurrido</strong>
        </p>

        <textarea
          value={descargo}
          onChange={(e) => setDescargo(e.target.value)}
          placeholder="Explicá qué ocurrió..."
          style={{
            width: "100%",
            minHeight: "180px",
            padding: "12px",
            borderRadius: "10px",
            border: "1px solid #444",
            background: "#111",
            color: "white",
            resize: "vertical",
            marginTop: "10px",
          }}
        />

        <div style={{ marginTop: "20px" }}>
  <p>
    <strong>Adjuntar fotos (máximo 4)</strong>
  </p>

  <input
  ref={inputFotosRef}
style={{ display: "none" }}
    type="file"
    accept="image/*"
    multiple
    onChange={(e) => {
  const nuevasFotos = Array.from(e.target.files || []);

  setFotos((anteriores) => {
    const todas = [...anteriores, ...nuevasFotos];

    return todas.slice(0, 4);
  });

  e.target.value = "";
}}
  />
  <button
  type="button"
  onClick={() => inputFotosRef.current?.click()}
  style={{
    marginTop: "10px",
    background: "#FF7A00",
    color: "white",
    border: "none",
    borderRadius: "10px",
    padding: "12px 18px",
    fontWeight: "bold",
    cursor: "pointer",
  }}
>
  📷 Agregar fotos
</button>
  {fotos.length > 0 && (
  <div
    style={{
      display: "flex",
      gap: "10px",
      marginTop: "20px",
      flexWrap: "wrap",
    }}
  >
    {fotos.map((foto, index) => (
  <div
    key={index}
    style={{
      position: "relative",
      width: "120px",
      height: "120px",
    }}
  >
    <button
      onClick={() =>
        setFotos((prev) => prev.filter((_, i) => i !== index))
      }
      style={{
        position: "absolute",
        top: "-8px",
        right: "-8px",
        width: "24px",
        height: "24px",
        borderRadius: "50%",
        border: "none",
        background: "#C62828",
        color: "white",
        cursor: "pointer",
        fontWeight: "bold",
        zIndex: 2,
      }}
    >
      ×
    </button>

    <img
      src={URL.createObjectURL(foto)}
      alt={`Foto ${index + 1}`}
      style={{
        width: "120px",
        height: "120px",
        objectFit: "cover",
        borderRadius: "10px",
        border: "1px solid #444",
      }}
    />
  </div>
))}
  </div>
)}
</div>
      </div>

<button
  onClick={async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const subirImagen = async (file: File, index: number) => {
  const fileName = `${operacionId}-${Date.now()}-${index}.jpg`;

  const { error } = await supabase.storage
    .from("resguardos")
    .upload(fileName, file, {
      contentType: "image/jpeg",
    });

  if (error) {
    console.log(error);
    return null;
  }

  const { data } = supabase.storage
    .from("resguardos")
    .getPublicUrl(fileName);

  return data.publicUrl;
};

 if (fotos.length > 0) {
  const fotosComprimidas = await Promise.all(
    fotos.map(async (foto) => {
      return await imageCompression(foto, {
        maxWidthOrHeight: 1200,
        maxSizeMB: 0.5,
        useWebWorker: true,
      });
    })
  );

  const urls = await Promise.all(
    fotosComprimidas.map((foto, index) =>
      subirImagen(foto as File, index)
    )
  );

  console.log("URLs subidas:", urls);
}

  const { error } = await supabase
    .from("owner_claims")
    .insert({
      operacion_id: operacionId,
      owner_id: user.id,
      description: descargo,
    });

  if (error) {
    console.log(error);
    alert(error.message);
    return;
  }

  alert("Descargo guardado correctamente.");

  router.push("/perfil");

}}
  style={{
    marginTop: "20px",
    width: "100%",
    background: "#FF7A00",
    color: "white",
    border: "none",
    borderRadius: "12px",
    padding: "14px",
    fontWeight: "bold",
    cursor: "pointer",
  }}
>
  Enviar descargo
</button>

    </main>
  );
}