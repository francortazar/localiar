"use client";
import imageCompression from "browser-image-compression";
import Link from "next/link";
import React, { useState } from "react";
import { supabase } from "../lib/supabase";
export default function PublicarPage() {
    
    const [precio, setPrecio] = useState("");
    const [resguardo, setResguardo] = useState("");
    const [titulo, setTitulo] = useState("");
const [descripcion, setDescripcion] = useState("");
const [provincia, setProvincia] = useState("");
const [ciudad, setCiudad] = useState("");
const [direccion, setDireccion] = useState("");
    const hoy = new Date();

const mesActual = hoy.getMonth();
const anioActual = hoy.getFullYear();
const diaActual = hoy.getDate();
const meses = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];
const [mesSeleccionado, setMesSeleccionado] =
  useState(mesActual);

const [anioSeleccionado, setAnioSeleccionado] =
  useState(anioActual);
  const [diasSeleccionados, setDiasSeleccionados] =
  useState<string[]>([]);
  
  const [imagenes, setImagenes] =
  useState<File[]>([]);
const diasMes = new Date(
  anioSeleccionado,
  mesSeleccionado + 1,
  0
).getDate();

const primerDiaSemana = new Date(
  anioSeleccionado,
  mesSeleccionado,
  1
).getDay();

const offset = primerDiaSemana === 0 ? 6 : primerDiaSemana - 1;

const precioNumero = Number(precio.replace(/\./g, "")) || 0;

const montoACobrar = precioNumero - precioNumero * 0.075;

function toggleCategoria(
  categoria: string
) {
  setCategorias((prev) =>
    prev.includes(categoria)
      ? prev.filter(
          (c) => c !== categoria
        )
      : [...prev, categoria]
  );
}

async function publicar() {

    if (categorias.length === 0) {
  alert(
    "Debes seleccionar al menos una categoría"
  );
  return;
}

    if (titulo.trim().length === 0) {
  alert("Debes ingresar un título");
  return;
}

if (titulo.length > 50) {
  alert("El título no puede superar los 50 caracteres");
  return;
}

if (descripcion.trim().length === 0) {
  alert("Debes ingresar una descripción");
  return;
}

if (descripcion.length > 240) {
  alert("La descripción no puede superar los 240 caracteres");
  return;
}

    if (imagenes.length === 0) {
  alert(
    "Debes cargar al menos una foto"
  );
  return;
}
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    alert("Debes iniciar sesión");
    return;
  }

 const { data, error } =
  await supabase
    .from("publications")
    .insert([
      {
        owner_id: user.id,
        titulo,
        descripcion,
        provincia,
        ciudad,
        direccion,
        precio_dia:
          Number(
            precio.replace(/\./g, "")
          ) || 0,
        resguardo:
          Number(
            resguardo.replace(/\./g, "")
          ) || 0,

        disponibilidad_total:
          diasSeleccionados.length === 0,
      },
    ])
    .select()
    .single();

  if (error) {
    alert(error.message);
    return;
  }
  const categoriasInsert = categorias.map(
  (categoria) => ({
    publication_id: data.id,
    categoria,
  })
);

const { error: categoriasError } =
  await supabase
    .from("publication_categories")
    .insert(categoriasInsert);

if (categoriasError) {
  alert(categoriasError.message);
  return;
}
  if (diasSeleccionados.length > 0) {
  const fechas = diasSeleccionados.map(
  (fecha) => ({
    publication_id: data.id,
    fecha,
  })
);

  const { error: availabilityError } =
    await supabase
      .from("publication_availability")
      .insert(fechas);

  if (availabilityError) {
    alert(
      availabilityError.message
    );
    return;
  }
}
for (
  let i = 0;
  i < imagenes.length;
  i++
) {
  const imagen = imagenes[i];

  const nombreArchivo =
    `${data.id}/${Date.now()}-${i}.jpg`;

  const { error: uploadError } =
    await supabase.storage
      .from("publication-images")
      .upload(
        nombreArchivo,
        imagen
      );

  if (uploadError) {
    alert(uploadError.message);
    return;
  }

  const { data: urlData } =
    supabase.storage
      .from("publication-images")
      .getPublicUrl(
        nombreArchivo
      );

  const { error: imageError } =
  await supabase
    .from("publication_images")
    .insert({
      publication_id: data.id,
      image_url: urlData.publicUrl,
      orden: i + 1,
    });

if (imageError) {
  console.log(imageError);
  alert(imageError.message);
  return;
}
}
  alert("Publicación creada");
}
async function agregarImagen(
  e: React.ChangeEvent<HTMLInputElement>
) {
  const archivos = e.target.files;

  if (!archivos) return;

  const nuevas = [...imagenes];

  for (const archivo of Array.from(archivos)) {
    if (nuevas.length >= 4) break;

    const comprimida =
      await imageCompression(archivo, {
        maxSizeMB: 0.4,
        maxWidthOrHeight: 1200,
      });

    nuevas.push(comprimida);
  }

  setImagenes(nuevas);
}
function eliminarImagen(index: number) {
  setImagenes((prev) =>
    prev.filter((_, i) => i !== index)
  );
}

const [categorias, setCategorias] =
  useState<string[]>([]);
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#050505",
        color: "white",
        padding: "20px",
        paddingBottom: "120px",
      }}
    >
      <h1
        style={{
          color: "#FF7A00",
          fontSize: "28px",
          fontWeight: "bold",
          marginBottom: "25px",
        }}
      >
        Crear publicación
      </h1>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "18px",
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        {/* TITULO */}

        <div>
          <label>Título *</label>

          <input
  type="text"
  maxLength={50}
  placeholder="Ej: Peluquería Masculina Premium"
  style={inputStyle}
  value={titulo}
  onChange={(e) => setTitulo(e.target.value)}
/>

          <p style={counterStyle}>
  {titulo.length} / 50
</p>
        </div>

        {/* DESCRIPCION */}

        <div>
          <label>Descripción *</label>

          <textarea
            maxLength={240}
            placeholder="Describí tu espacio..."
            style={{
              ...inputStyle,
              minHeight: "120px",
              resize: "none",
              
            }}
            value={descripcion}
onChange={(e) =>
  setDescripcion(e.target.value)
}
          />

          <p style={counterStyle}>
  {descripcion.length} / 240
</p>
        </div>

        {/* PROVINCIA */}

        <div>
          <label>Provincia *</label>

          <select
  style={inputStyle}
  value={provincia}
  onChange={(e) =>
    setProvincia(e.target.value)
  }
>
            <option>Seleccionar provincia</option>
            <option>Buenos Aires</option>
            <option>CABA</option>
            <option>Córdoba</option>
            <option>San Luis</option>
            <option>Mendoza</option>
          </select>
        </div>

        {/* CIUDAD */}

        <div>
          <label>Ciudad *</label>

          <input
  type="text"
  placeholder="Ej: Villa Mercedes"
  style={inputStyle}
  value={ciudad}
  onChange={(e) =>
    setCiudad(e.target.value)
  }
/>
        </div>

        {/* DIRECCION */}

        <div>
          <label>Dirección *</label>

          <input
  type="text"
  placeholder="Ej: Av. Mitre 123"
  style={inputStyle}
  value={direccion}
  onChange={(e) =>
    setDireccion(e.target.value)
  }
/>
        </div>


        {/* CATEGORIAS */}

        <div style={sectionStyle}>
          <h2 style={sectionTitle}>Categorías *</h2>

          <div style={checkboxGrid}>
            {[
              "Peluquería",
              "Estética",
              "Gastronomía",
              "Salud",
              "Fitness",
              "Educación",
              "Taller",
              "Comercio",
              "Coworking",
              "Fondo de comercio",
              "Local vacío",
            ].map((item) => (
              <label key={item}>
                <input
  type="checkbox"
  checked={categorias.includes(item)}
  onChange={() =>
    toggleCategoria(item)
  }
/> {item}
              </label>
            ))}
          </div>
        </div>

        {/* REQUISITOS */}

        <div style={sectionStyle}>
          <h2 style={sectionTitle}>Requisitos</h2>

          <div style={checkboxGrid}>
            {[
              "Experiencia",
              "Matrícula",
              "Título",
              "Seguro",
              "Otro",
            ].map((item) => (
              <label key={item}>
                <input type="checkbox" /> {item}
              </label>
            ))}
          </div>
        </div>

        {/* PRECIO */}

        <div>
          <label>Precio por día *</label>

          <input
  type="text"
  placeholder="$ 0"
  style={inputStyle}
  value={precio}
  onChange={(e) => {
    const valor = e.target.value.replace(/\D/g, "");

    setPrecio(
      valor
        ? Number(valor).toLocaleString("es-AR")
        : ""
    );
  }}
/>
        </div>

        {/* COBRARAS */}

       <div
  style={{
    background: "#111111",
    border: "1px solid #FF7A00",
    borderRadius: "12px",
    padding: "14px",
  }}
>
  <p
    style={{
      marginBottom: "8px",
      color: "#cccccc",
    }}
  >
    Costos operativos incluidos
  </p>

  <p
    style={{
      color: "#5CFF7A",
      fontWeight: "bold",
      fontSize: "18px",
    }}
  >
    Monto a cobrar: $
{Math.round(montoACobrar).toLocaleString("es-AR")}
  </p>
</div>

        {/* RESGUARDO */}

        <div>
          <label>Monto de resguardo *</label>

          <input
  type="text"
  placeholder="$ 0"
  style={inputStyle}
  value={resguardo}
  onChange={(e) => {
    const valor = e.target.value.replace(/\D/g, "");

    setResguardo(
      valor
        ? Number(valor).toLocaleString("es-AR")
        : ""
    );
  }}
/>

          <p
            style={{
              fontSize: "13px",
              color: "#aaaaaa",
              marginTop: "6px",
            }}
          >
            Este monto será retenido por Localiar y devuelto al finalizar
            la operación si no existen reclamos.
          </p>
        </div>

        {/* DISPONIBILIDAD */}

<div style={sectionStyle}>
  <h2 style={sectionTitle}>Disponibilidad</h2>

  <div
    style={{
      display: "flex",
      gap: "10px",
      marginBottom: "15px",
    }}
  >
    <select
      value={mesSeleccionado}
      onChange={(e) =>
        setMesSeleccionado(Number(e.target.value))
      }
      style={inputStyle}
    >
      {meses.map((mes, index) => (
        <option key={mes} value={index}>
          {mes}
        </option>
      ))}
    </select>

    <select
      value={anioSeleccionado}
      onChange={(e) =>
        setAnioSeleccionado(Number(e.target.value))
      }
      style={inputStyle}
    >
      <option value={anioActual}>{anioActual}</option>
      <option value={anioActual + 1}>
        {anioActual + 1}
      </option>
    </select>
  </div>

  <div
    style={{
      background: "#1a1a1a",
      padding: "15px",
      borderRadius: "12px",
    }}
  >
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(7,1fr)",
        gap: "6px",
        marginBottom: "10px",
        textAlign: "center",
        fontWeight: "bold",
        color: "#FF7A00",
      }}
    >
      {["L", "M", "X", "J", "V", "S", "D"].map((dia) => (
        <div key={dia}>{dia}</div>
      ))}
    </div>

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(7,1fr)",
        gap: "6px",
      }}
    >
      {Array.from({ length: offset }).map((_, i) => (
        <div key={`vacio-${i}`} />
      ))}

      {Array.from({ length: diasMes }, (_, i) => {
        const dia = i + 1;

        const esPasado =
          anioSeleccionado === anioActual &&
          mesSeleccionado === mesActual &&
          dia < diaActual;

        const fechaCompleta =
  `${anioSeleccionado}-${String(
    mesSeleccionado + 1
  ).padStart(2, "0")}-${String(
    dia
  ).padStart(2, "0")}`;

const seleccionado =
  diasSeleccionados.includes(
    fechaCompleta
  );

        return (
          <button
            key={dia}
            disabled={esPasado}
            onClick={() => {
              if (esPasado) return;

              setDiasSeleccionados((prev) =>
  prev.includes(fechaCompleta)
    ? prev.filter(
        (f) => f !== fechaCompleta
      )
    : [...prev, fechaCompleta]
);
            }}
            style={{
              height: "42px",
              border: "none",
              borderRadius: "8px",
              cursor: esPasado
                ? "not-allowed"
                : "pointer",
              fontWeight: "bold",
              background: esPasado
                ? "#555"
                : seleccionado
                ? "#1FAA59"
                : "#8B0000",
              color: "white",
            }}
          >
            {dia}
          </button>
        );
      })}
    </div>
  </div>

  <p
    style={{
      marginTop: "12px",
      color: "#cccccc",
      fontSize: "14px",
    }}
  >
    Días seleccionados: {diasSeleccionados.length}
  </p>
</div>

        {/* FOTOS */}

        <div style={sectionStyle}>
  <h2 style={sectionTitle}>
    Fotos ({imagenes.length}/4)
  </h2>

  <input
    type="file"
    multiple
    accept="image/*"
    onChange={agregarImagen}
  />

  <div
    style={{
      display: "grid",
      gridTemplateColumns:
        "repeat(2,1fr)",
      gap: "12px",
      marginTop: "15px",
    }}
  >
    {imagenes.map(
      (imagen, index) => (
        <div
          key={index}
          style={{
            position: "relative",
          }}
        >
          <img
            src={URL.createObjectURL(
              imagen
            )}
            alt=""
            style={{
              width: "100%",
              height: "140px",
              objectFit: "cover",
              borderRadius: "12px",
            }}
          />

          <button
            type="button"
            onClick={() =>
              eliminarImagen(index)
            }
            style={{
              position: "absolute",
              top: "6px",
              right: "6px",
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              border: "none",
              background:
                "#8B0000",
              color: "white",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            ✕
          </button>
        </div>
      )
    )}
  </div>
</div>
        

        {/* BOTON */}

        <button
        onClick={publicar}
          style={{
            background: "#FF7A00",
            color: "white",
            border: "none",
            padding: "16px",
            borderRadius: "12px",
            fontSize: "18px",
            fontWeight: "bold",
            cursor: "pointer",
            
          }}
          
        >
          PUBLICAR
          
        </button>
      </div>
      <footer
  style={{
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    height: "70px",
    background: "#0D1F3D",
    borderTop: "1px solid rgba(255,255,255,0.1)",
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    boxShadow: "0 -4px 12px rgba(0,0,0,0.4)",
    zIndex: 1000,
  }}
>
  <Link
  href="/"
  style={{
    color: "white",
    fontSize: "16px",
    fontWeight: "bold",
    textDecoration: "none",
  }}
>
  🏠 Home
</Link>

  <Link
  href="/perfil"
  style={{
    color: "white",
    fontSize: "16px",
    fontWeight: "bold",
    textDecoration: "none",
  }}
>
  👤 Usuario
</Link>
</footer>
    </main>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px",
  borderRadius: "10px",
  border: "none",
  marginTop: "6px",
  background: "white",
  color: "black",
};

const counterStyle = {
  fontSize: "12px",
  color: "#999",
  marginTop: "4px",
};

const sectionStyle = {
  background: "#111111",
  padding: "18px",
  borderRadius: "16px",
};

const sectionTitle = {
  marginBottom: "12px",
  color: "#FF7A00",
};

const checkboxGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "10px",
};