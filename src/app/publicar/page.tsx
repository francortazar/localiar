"use client";
import imageCompression from "browser-image-compression";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { obtenerCategorias } from "../lib/categories";
import { obtenerProvincias } from "../lib/provinces";
import { useRouter } from "next/navigation";

export default function PublicarPage() {
    const router = useRouter();
    const [precio, setPrecio] = useState("");
    const [resguardo, setResguardo] = useState("");
    const [titulo, setTitulo] = useState("");
const [descripcion, setDescripcion] = useState("");
const [provincia, setProvincia] = useState("");
const [ciudad, setCiudad] = useState("");
const [direccion, setDireccion] = useState("");
    const hoy = new Date();
    const [aliasPago, setAliasPago] = useState("");
    const [categoriasDisponibles, setCategoriasDisponibles] = useState<
  { id: string; nombre: string }[]
>([]);

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

useEffect(() => {
  async function cargarCategorias() {
    const categorias = await obtenerCategorias();
    setCategoriasDisponibles(categorias);
  }

  cargarCategorias();
}, []);

useEffect(() => {
  async function cargarProvincias() {
    const data = await obtenerProvincias();
    setProvincias(data);
  }

  cargarProvincias();
}, []);

useEffect(() => {
  async function cargarUsuario() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("nombre")
      .eq("id", user.id)
      .single();

    setUsuario(data);
  }

  cargarUsuario();
}, []);

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

if (aliasPago.trim().length === 0) {
  alert("Debes ingresar un alias para recibir los pagos");
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
  alias_pago: aliasPago.trim(),
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
  router.push(`/publicacion/${data.id}`);
}
async function agregarImagen(
  e: React.ChangeEvent<HTMLInputElement>
) {
  const archivos = e.target.files;

  if (!archivos) return;

  const nuevas = [...imagenes];

for (const archivo of Array.from(archivos)) {
  if (nuevas.length >= 4) break;

  if (!archivo.type.startsWith("image/")) {
    continue;
  }

  try {
    const comprimida =
      await imageCompression(archivo, {
        maxSizeMB: 0.4,
        maxWidthOrHeight: 1200,
      });

    nuevas.push(comprimida);

  } catch (error) {
    console.log("Imagen no compatible:", archivo.name);
  }
}

  setImagenes(nuevas);
}
function eliminarImagen(index: number) {
  setImagenes((prev) =>
    prev.filter((_, i) => i !== index)
  );
}

const [categorias, setCategorias] = useState<string[]>([]);
const [provincias, setProvincias] = useState<any[]>([]);
const [usuario, setUsuario] = useState<any>(null);
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
      <div
  style={{
    display: "flex",
    alignItems: "baseline",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "25px",
  }}
>
  <h1
    style={{
      color: "#FF7A00",
      fontSize: "28px",
      fontWeight: "bold",
      margin: 0,
    }}
  >
    Crear publicación
  </h1>

  <span
    style={{
      color: "#AAAAAA",
      fontSize: "15px",
      fontWeight: "normal",
    }}
  >
    Nunca perdés el control de tu local, podés cancelar cuando quieras
  </span>
</div>

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
            <option value="">
  Seleccionar provincia
</option>

{provincias.map((provincia) => (
  <option
    key={provincia.id}
    value={provincia.nombre}
  >
    {provincia.nombre}
  </option>
))}
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
           {categoriasDisponibles.map((categoria) => (
              <label key={categoria.id}>
                <input
  type="checkbox"
  checked={categorias.includes(categoria.nombre)}
  onChange={() =>
    toggleCategoria(categoria.nombre)
  }
/> {categoria.nombre}
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

        {/* ALIAS DE PAGO */}

<div>
  <label>Alias para recibir pagos *</label>

  <input
    type="text"
    placeholder="Ej: mi.local.mp"
    style={inputStyle}
    value={aliasPago}
    onChange={(e) => setAliasPago(e.target.value)}
  />

  <p
    style={{
      fontSize: "13px",
      color: "#aaaaaa",
      marginTop: "6px",
    }}
  >
    Este alias será utilizado por Localiar para transferirte
    el dinero correspondiente a tus reservas.
  </p>
</div>

        {/* DISPONIBILIDAD */}

<div style={sectionStyle}>
  <h2 style={sectionTitle}>Disponibilidad</h2>

  <div
    style={{
      background: "#3A1F00",
      border: "2px solid #FF7A00",
      borderRadius: "12px",
      padding: "16px",
      marginBottom: "18px",
    }}
  >
    <p
      style={{
        margin: 0,
        color: "#FF7A00",
        fontSize: "17px",
        fontWeight: "bold",
        marginBottom: "8px",
      }}
    >
      ⚠️ Importante sobre la disponibilidad
    </p>

    <p
      style={{
        margin: 0,
        color: "#FFFFFF",
        fontSize: "15px",
        lineHeight: "1.5",
      }}
    >
      Si no seleccionás ninguna fecha en el calendario,
      el sistema interpretará que el espacio está
      <strong> disponible todos los días</strong>.
    </p>
  </div>

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

  <label
  style={{
    display: "inline-block",
    background: "#FF7A00",
    color: "white",
    padding: "12px 18px",
    borderRadius: "10px",
    fontWeight: "bold",
    cursor: "pointer",
  }}
>
  📷 Agregar fotos

  <input
    type="file"
    multiple
    accept="image/*"
    onChange={agregarImagen}
    style={{ display: "none" }}
  />
</label>

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

                {/* INFORMACIÓN LEGAL */}

        <div
          style={{
            marginTop: "18px",
            color: "#aaaaaa",
            fontSize: "13px",
            lineHeight: "1.6",
          }}
        >
          <p
            style={{
              marginBottom: "10px",
              fontWeight: "bold",
              color: "#aaaaaa",
            }}
          >
            Información legal y condiciones de publicación
          </p>

          <p style={{ marginBottom: "10px" }}>
            Al publicar este espacio en Localiar, el propietario declara
            bajo su responsabilidad que toda la información, documentación,
            fotografías, precios, características, condiciones de uso,
            disponibilidad y demás datos proporcionados son verdaderos,
            completos, actuales y corresponden efectivamente al espacio
            ofrecido.
          </p>

          <p style={{ marginBottom: "10px" }}>
            Localiar actúa exclusivamente como una plataforma tecnológica
            e intermediario que facilita el contacto y la gestión de
            operaciones entre propietarios y usuarios. Localiar no es
            propietario, locador, explotador comercial, administrador ni
            responsable directo de los espacios publicados por terceros,
            salvo respecto de aquellas obligaciones que expresamente
            correspondan a Localiar por la legislación aplicable.
          </p>

          <p style={{ marginBottom: "10px" }}>
            El propietario es el único responsable por la exactitud,
            legalidad y legitimidad de la información incorporada en su
            publicación, así como por las condiciones reales del espacio,
            su estado de conservación, seguridad, características,
            disponibilidad, precio, documentación y cualquier otra
            circunstancia relacionada con el inmueble, establecimiento,
            actividad o servicio ofrecido.
          </p>

          <p style={{ marginBottom: "10px" }}>
            Asimismo, el propietario declara ser mayor de edad y contar con
            capacidad legal suficiente para publicar el espacio y celebrar
            las operaciones que pudieran derivarse de su publicación.
            Declara también que posee, mantiene vigentes y se encuentra en
            condiciones de acreditar todas las habilitaciones, permisos,
            licencias, autorizaciones, matrículas, seguros, certificaciones
            y demás requisitos exigidos por las autoridades nacionales,
            provinciales y municipales competentes, así como por organismos
            privados o entidades regulatorias que pudieran resultar
            aplicables a la actividad desarrollada en el espacio publicado.
          </p>

          <p style={{ marginBottom: "10px" }}>
            El propietario manifiesta que la actividad comercial,
            profesional o de cualquier otra naturaleza desarrollada en el
            espacio publicado se encuentra encuadrada dentro del marco
            legal aplicable y que no utilizará Localiar para ofrecer,
            promocionar, facilitar o concretar actividades ilícitas,
            prohibidas, fraudulentas o que requieran autorizaciones de las
            cuales no disponga.
          </p>

          <p style={{ marginBottom: "10px" }}>
            El propietario será responsable de mantener actualizada la
            información de su publicación y deberá modificar o retirar
            inmediatamente cualquier dato que haya dejado de ser correcto,
            especialmente la disponibilidad, precio, condiciones de uso,
            características del espacio y cualquier requisito legal
            necesario para su utilización.
          </p>

          <p style={{ marginBottom: "10px" }}>
            La publicación de un espacio en Localiar no implica que Localiar
            certifique, verifique, garantice ni avale la exactitud de la
            información proporcionada por el propietario, ni que haya
            realizado una inspección física, técnica, comercial, sanitaria,
            profesional, edilicia o administrativa del espacio, salvo que
            expresamente se indique lo contrario.
          </p>

          <p style={{ marginBottom: "10px" }}>
            El propietario asume la responsabilidad por cualquier reclamo,
            sanción, multa, daño, perjuicio, incumplimiento contractual,
            infracción administrativa, tributaria, comercial, profesional,
            laboral, sanitaria, civil o de cualquier otra naturaleza que
            pudiera derivarse de la actividad desarrollada en el espacio o
            de la información proporcionada para su publicación, en la
            medida permitida por la legislación aplicable.
          </p>

          <p style={{ marginBottom: "10px" }}>
            El propietario también declara que cuenta con los derechos,
            autorizaciones y permisos necesarios respecto de las fotografías,
            textos, marcas, nombres comerciales, logotipos, documentos y
            demás contenidos que incorpore a Localiar, y que dichos contenidos
            no infringen derechos de terceros.
          </p>

          <p style={{ marginBottom: "10px" }}>
            Localiar podrá suspender, ocultar o retirar una publicación
            cuando detecte información presuntamente falsa, incompleta,
            engañosa, desactualizada o contraria a la legislación aplicable,
            a las condiciones de uso de la plataforma o a los intereses de
            seguridad de sus usuarios, sin que ello implique asumir
            responsabilidad sobre la información originalmente proporcionada
            por el propietario.
          </p>

          <p style={{ marginBottom: "10px" }}>
            La utilización de Localiar supone la aceptación de las
            condiciones de uso de la plataforma y de las responsabilidades
            que correspondan a cada usuario según su participación en la
            operación. Ninguna disposición de estas condiciones pretende
            excluir o limitar derechos que legalmente resulten
            irrenunciables, ni las responsabilidades que por ley no puedan
            ser excluidas o limitadas.
          </p>

          <p
            style={{
              marginTop: "16px",
              fontWeight: "bold",
              color: "#aaaaaa",
            }}
          >
            Al presionar “PUBLICAR”, el propietario declara haber leído,
            comprendido y aceptado estas condiciones y confirma que la
            información proporcionada es verdadera y que cuenta con las
            autorizaciones y habilitaciones necesarias para ofrecer el
            espacio publicado.
          </p>
        </div>

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
  👤 {usuario?.nombre || "Perfil"}
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