"use client";
import { useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { registrarEventoPublicacion } from "../../lib/publicationEvents";
import { useParams } from "next/navigation";


import Link from "next/link";
import { useState } from "react";

export default function PublicacionPage() {

const [categorias, setCategorias] =
  useState<any[]>([]);

  const [fechasDisponibles, setFechasDisponibles] =
  useState<string[]>([]);

  const params = useParams();
  const publicationId = params.id as string;
  
  const id = params.id as string;
  const hoy = new Date();

  const [mesSeleccionado, setMesSeleccionado] =
    useState(hoy.getMonth());

  const [anioSeleccionado, setAnioSeleccionado] =
    useState(hoy.getFullYear());
    const [mensaje, setMensaje] = useState("");
    const [mensajes, setMensajes] =
  useState<any[]>([]);

  const [usuarioActual, setUsuarioActual] =
  useState("");

  
    const [publicacion, setPublicacion] =
  useState<any>(null);

  const [esFavorito, setEsFavorito] =
  useState(false);

  const [fotoActual, setFotoActual] =
  useState(0);

  const [respuesta, setRespuesta] =
  useState("");

const [preguntaSeleccionada,
  setPreguntaSeleccionada] =
  useState<string | null>(null);

  const [esAnfitrion, setEsAnfitrion] =
  useState(false);

  const [fechasReservadas, setFechasReservadas] =
  useState<string[]>([]);

  useEffect(() => {
  cargarPublicacion();
  cargarMensajes();
  cargarUsuarioActual();
  verificarFavorito();
}, []);

function compartirWhatsapp() {

  const url = `${window.location.origin}/publicacion/${id}`;

  const texto =
    `¡Mirá este espacio que encontré en Localiar!\n\n${url}`;

  const whatsappUrl =
    `https://wa.me/?text=${encodeURIComponent(texto)}`;

  window.open(
    whatsappUrl,
    "_blank"
  );
}

async function toggleFavorito() {

  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    alert("Debés iniciar sesión.");
    return;
  }

  if (esFavorito) {
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("usuario_id", user.id)
      .eq("publication_id", id);

    if (error) {
      alert(error.message);
      return;
    }

    setEsFavorito(false);
  } else {
    const { error } = await supabase
      .from("favorites")
      .insert({
        usuario_id: user.id,
        publication_id: id,
      });

    if (error) {
      alert(error.message);
      return;
    }

    setEsFavorito(true);
  }
}

async function cargarMensajes() {
  const { data, error } =
    await supabase
      .from("publication_messages")
      .select(`
        *,
        profiles (
          nombre
        )
      `)
      .eq("publication_id", id)
      .order("created_at", {
        ascending: false,
      });

  

if (!error && data) {
  setMensajes(data);
}
}

async function verificarFavorito() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { data } = await supabase
    .from("favorites")
    .select("id")
    .eq("usuario_id", user.id)
    .eq("publication_id", id)
    .maybeSingle();

  setEsFavorito(!!data);
}

async function cargarUsuarioActual() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { data } =
    await supabase
      .from("profiles")
      .select("nombre")
      .eq("id", user.id)
      .single();

  if (data) {
    setUsuarioActual(
      data.nombre
    );
  }
}

async function publicarPregunta() {
  if (!mensaje.trim()) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    alert("Debes iniciar sesión");
    return;
  }

  const { data: perfil } =
    await supabase
      .from("profiles")
      .select("nombre")
      .eq("id", user.id)
      .single();

  const { error } =
    await supabase
      .from("publication_messages")
      .insert([
        {
          publication_id: id,
          user_id: user.id,
          nombre_usuario:
            perfil?.nombre || "Usuario",
          tipo: esAnfitrion
  ? "novedad"
  : "pregunta",
          texto: mensaje,
        },
      ]);

  if (error) {
    alert(error.message);
    return;
  }

  setMensaje("");

  cargarMensajes();
}
  
async function responderPregunta(
  parentId: string
) 

{
  if (!respuesta.trim()) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { error } =
    await supabase
      .from("publication_messages")
      .insert([
        {
          publication_id: id,
          user_id: user.id,
          tipo: "respuesta",
          texto: respuesta,
          parent_id: parentId,
        },
      ]);

  if (error) {
    alert(error.message);
    return;
  }

  setRespuesta("");
  setPreguntaSeleccionada(null);

  cargarMensajes();
}

async function eliminarMensaje(
  mensajeId: string
) {
  const confirmar = confirm(
    "¿Eliminar este mensaje?"
  );

  if (!confirmar) return;

  await supabase
    .from("publication_messages")
    .delete()
    .eq("parent_id", mensajeId);

  const { error } =
    await supabase
      .from("publication_messages")
      .delete()
      .eq("id", mensajeId);

  if (error) {
    alert(error.message);
    return;
  }

  cargarMensajes();
}


async function cargarPublicacion() {

  const { data: reservas } = await supabase
  .from("reservations")
  .select("fecha")
  .eq("publication_id", id);

if (reservas) {
  setFechasReservadas(
    reservas.map((r) => r.fecha)
  );
}
  const { data, error } =
  await supabase
    .from("publications")
    .select(`
  *,
  profiles (
    nombre
  ),
  publication_images (
    image_url,
    orden
  )
`)
    .eq("id", id)
    .single();

  if (!error && data) {
    setPublicacion(data);

    await registrarEventoPublicacion(
      data.id,
      "view",
      
    );

const { data: categoriasData } =
  await supabase
    .from("publication_categories")
    .select("*")
    .eq("publication_id", id);

setCategorias(categoriasData || []);

    const {
  data: { user },
} = await supabase.auth.getUser();

if (
  user &&
  user.id === data.owner_id
) {
  setEsAnfitrion(true);
}

    if (!data.disponibilidad_total) {
      const {
        data: availability,
      } = await supabase
        .from("publication_availability")
        .select("fecha")
        .eq("publication_id", id);

      if (availability) {
        setFechasDisponibles(
          availability.map(
            (item) => item.fecha
          )
        );
      }
    }
  }
} 



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

  

  const primerDiaMes = new Date(
    anioSeleccionado,
    mesSeleccionado,
    1
  ).getDay();

  const diasMes = new Date(
    anioSeleccionado,
    mesSeleccionado + 1,
    0
  ).getDate();

  const offset =
    primerDiaMes === 0 ? 6 : primerDiaMes - 1;
    if (!publicacion) {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#050505",
        color: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      Cargando...
    </main>
  );
}
  return (
    <main
      style={{
        background: "#050505",
        minHeight: "100vh",
        color: "white",
        paddingBottom: "180px",
      }}
    >
      {/* FOTO PRINCIPAL */}

<div
  style={{
    position: "relative",
  }}
>
  {publicacion.publication_images?.length >
  0 ? (
    <>
      <img
        src={
          publicacion.publication_images.sort(
            (a: any, b: any) =>
              a.orden - b.orden
          )[fotoActual]?.image_url
        }
        alt=""
        style={{
          width: "100%",
          height: "280px",
          objectFit: "cover",
        }}
      />

      {publicacion.publication_images
        .length > 1 && (
        <>
          <button
            onClick={() =>
              setFotoActual((prev) =>
                prev === 0
                  ? publicacion
                      .publication_images
                      .length - 1
                  : prev - 1
              )
            }
            style={{
              position: "absolute",
              left: "10px",
              top: "50%",
              transform:
                "translateY(-50%)",
              background:
                "rgba(0,0,0,0.5)",
              color: "white",
              border: "none",
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              cursor: "pointer",
            }}
          >
            ◀
          </button>

          <button
            onClick={() =>
              setFotoActual((prev) =>
                prev ===
                publicacion
                  .publication_images
                  .length -
                  1
                  ? 0
                  : prev + 1
              )
            }
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform:
                "translateY(-50%)",
              background:
                "rgba(0,0,0,0.5)",
              color: "white",
              border: "none",
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              cursor: "pointer",
            }}
          >
            ▶
          </button>
        </>
      )}
    </>
  ) : (
    <div
      style={{
        height: "280px",
        background:
          "linear-gradient(135deg,#0D1F3D,#FF7A00)",
      }}
    />
  )}
</div>

      {/* INDICADORES */}

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "8px",
          marginTop: "12px",
        }}
      >
        {publicacion.publication_images?.map(
  (_: any, index: number) => (
    <div
      key={index}
      style={{
        width: "10px",
        height: "10px",
        borderRadius: "50%",
        background:
          index === fotoActual
            ? "#FF7A00"
            : "#444",
      }}
    />
  )
)}
      </div>

      <div
        style={{
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        {/* TITULO */}

        <div>
          <div
            style={{
              display: "flex",
flexWrap: "wrap",
gap: "10px",
            }}
          >
            <h1
              style={{
                fontSize: "28px",
                fontWeight: "bold",
              }}
            >
              {publicacion.titulo}
            </h1>

            <div
  style={{
    display: "flex",
    gap: "12px",
    alignItems: "center",
  }}
>
  <button
    onClick={toggleFavorito}
    style={{
      background: "transparent",
      border: "none",
      cursor: "pointer",
      fontSize: "28px",
      padding: 0,
    }}
  >
    {esFavorito ? "❤️" : "🤍"}
  </button>

  <button
  onClick={compartirWhatsapp}
  style={{
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: "24px",
    padding: 0,
  }}
>
  📤
</button>
</div>
          </div>

          <p
            style={{
              color: "#cccccc",
              marginTop: "8px",
            }}
          >
            👤 {publicacion.profiles?.nombre}
          </p>

          <p
  style={{
    color: "#FF7A00",
  }}
>
  ⭐ 4.8 · {publicacion.operaciones || 0}{" "}
  {(publicacion.operaciones || 0) === 1
    ? "operación"
    : "operaciones"}
</p>
        </div>

        {/* UBICACION */}

        <div
          style={{
            background: "#111111",
            borderRadius: "16px",
            padding: "16px",
          }}
        >
          <h3 style={{ color: "#FF7A00" }}>
            Ubicación
          </h3>

          <div>
  📍 {publicacion.direccion}
</div>

          <p>
            {publicacion.ciudad},{" "}
{publicacion.provincia}
          </p>
        </div>

        {/* CATEGORIAS */}

<div
  style={{
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  }}
>
  {categorias.map((cat) => (
    <span
      key={cat.id}
      style={badgeStyle}
    >
      {cat.categoria}
    </span>
  ))}
</div>

        {/* DESCRIPCION */}

        <section style={cardStyle}>
  <h3 style={titleStyle}>
    Descripción
  </h3>

  <p
    style={{
      overflowWrap: "break-word",
      wordBreak: "break-word",
      whiteSpace: "pre-wrap",
    }}
  >
    {publicacion.descripcion}
  </p>
</section>

        {/* REQUISITOS */}

        <section style={cardStyle}>
          <h3 style={titleStyle}>
            Requisitos
          </h3>

          <p>✓ Experiencia</p>
          <p>✓ Seguro</p>
        </section>

        {/* PRECIO */}

        <section style={cardStyle}>
          <h3 style={titleStyle}>
            Precio por día
          </h3>

          <h2
            style={{
              color: "#FF7A00",
              fontSize: "30px",
            }}
          >
            $
{Number(
  publicacion.precio_dia
).toLocaleString("es-AR")}
          </h2>
        </section>

        {/* RESGUARDO */}

        <section style={cardStyle}>
          <h3 style={titleStyle}>
            Resguardo
          </h3>

          <h2
            style={{
              color: "#5CFF7A",
            }}
          >
            $
{Number(publicacion.resguardo).toLocaleString("es-AR")}
          </h2>
        </section>
        <section style={cardStyle}>
  <h3 style={titleStyle}>
    Preguntas y novedades
  </h3>

  <textarea
    maxLength={100}
    value={mensaje}
    onChange={(e) =>
      setMensaje(e.target.value)
    }
    placeholder={
  esAnfitrion
    ? "Publicá una novedad..."
    : "Escribí una pregunta..."
}
    style={{
      width: "100%",
      minHeight: "80px",
      background: "#1a1a1a",
      color: "white",
      border: "1px solid #333",
      borderRadius: "10px",
      padding: "12px",
      resize: "none",
      marginBottom: "10px",
    }}
  />

  <div
  style={{
    textAlign: "right",
    color: "#999",
    fontSize: "12px",
    marginBottom: "10px",
  }}
>
  {mensaje.length}/100
</div>

  <button
  onClick={publicarPregunta}
    style={{
      width: "100%",
      background: "#FF7A00",
      color: "white",
      border: "none",
      borderRadius: "10px",
      padding: "12px",
      fontWeight: "bold",
      cursor: "pointer",
      marginBottom: "20px",
    }}
  >
    {esAnfitrion
  ? "PUBLICAR NOVEDAD"
  : "PUBLICAR PREGUNTA"}
  </button>

  {mensajes
  .filter(
    (item) =>
      item.tipo === "novedad"
  )
  .map((item) => (
    <div
      key={item.id}
      style={{
        background: "#143A20",
        border:
          "1px solid #5CFF7A",
        borderRadius: "12px",
        padding: "12px",
        marginBottom: "12px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          marginBottom: "8px",
        }}
      >
        <strong
          style={{
            color: "#5CFF7A",
          }}
        >
          📢 NOVEDAD

          {esAnfitrion && (
  <button
    onClick={() =>
      eliminarMensaje(item.id)
    }
    style={{
      marginTop: "10px",
      background: "#8B0000",
      color: "white",
      border: "none",
      padding: "8px 12px",
      borderRadius: "8px",
      cursor: "pointer",
    }}
  >
    Eliminar novedad
  </button>
)}
        </strong>

        <span
          style={{
            color: "#999",
            fontSize: "12px",
          }}
        >
          {new Date(
            item.created_at
          ).toLocaleString("es-AR")}
        </span>
      </div>

      <p>{item.texto}</p>
    </div>
  ))}

  {mensajes
  .filter(
  (item) =>
    item.parent_id === null &&
    item.tipo === "pregunta"
)
  .map((item) => (
    <div
      key={item.id}
      style={{
        background:
          item.autor === "anfitrion"
            ? "#143A20"
            : "#1a1a1a",

        border:
          item.autor === "anfitrion"
            ? "1px solid #5CFF7A"
            : "1px solid #333",

        borderRadius: "12px",
        padding: "12px",
        marginBottom: "12px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          marginBottom: "8px",
          fontSize: "12px",
        }}
      >
        <strong
  style={{
    color: "#FF7A00",
  }}
>
  {item.nombre_usuario || "Usuario"}
</strong>

<span
  style={{
    color: "#999",
  }}
>
  {new Date(
    item.created_at
  ).toLocaleString("es-AR")}
</span>
      </div>

      <p>{item.texto}</p>

      {mensajes
  .filter(
    (m) =>
      m.parent_id === item.id
  )
  .map((resp) => (
    <div
      key={resp.id}
      style={{
        marginTop: "10px",
        marginLeft: "20px",
        background: "#143A20",
        border:
          "1px solid #5CFF7A",
        borderRadius: "10px",
        padding: "10px",
      }}
    >
      <strong>
        {resp.profiles?.nombre}
      </strong>

      <div
        style={{
          fontSize: "12px",
          color: "#999",
          marginBottom: "5px",
        }}
      >
        {new Date(
          resp.created_at
        ).toLocaleString("es-AR")}
      </div>

      <p>{resp.texto}</p>
    </div>
  ))}

      {esAnfitrion && (
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginTop: "10px",
          }}
        >
          <button
  onClick={() =>
    setPreguntaSeleccionada(item.id)
  }
  style={{
    background: "#0D1F3D",
              color: "white",
              border: "none",
              padding:
                "8px 12px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Responder
          </button>
          

          <button
          onClick={() =>
  eliminarMensaje(item.id)
}
            style={{
              background: "#8B0000",
              color: "white",
              border: "none",
              padding:
                "8px 12px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Eliminar
          </button>
        </div>
      )}
      {preguntaSeleccionada === item.id && (
  <div
    style={{
      marginTop: "10px",
    }}
  >
    <textarea
      value={respuesta}
      onChange={(e) =>
        setRespuesta(
          e.target.value
        )
      }
      placeholder="Escribí una respuesta..."
      style={{
        
  marginTop: "12px",
  paddingTop: "12px",
  borderTop: "1px solid #333",

        width: "100%",
        minHeight: "70px",
        background: "#1a1a1a",
        color: "white",
        border: "1px solid #333",
        borderRadius: "8px",
        padding: "10px",
      }}
    />

    <button
      onClick={() =>
        responderPregunta(item.id)
      }
      style={{
        marginTop: "10px",
        background: "#5CFF7A",
        color: "black",
        border: "none",
        padding: "10px",
        borderRadius: "8px",
        fontWeight: "bold",
        cursor: "pointer",
      }}
    >
      Publicar respuesta
    </button>
  </div>
)}

      
    </div>
  ))}
</section>

        {/* DISPONIBILIDAD */}

        <section style={cardStyle}>
  <h3 style={titleStyle}>
    Disponibilidad: Marcar despues de presionar Reservar
  </h3>

  <div
    style={{
      display: "flex",
justifyContent: "space-between",
alignItems: "flex-start",
flexWrap: "wrap",
gap: "10px",
      marginBottom: "15px",
    }}
  >
    <button
      onClick={() =>
        setMesSeleccionado((prev) =>
          prev === 0 ? 11 : prev - 1
        )
      }
      style={mesBtn}
    >
      ◀
    </button>

    <strong>
      {meses[mesSeleccionado]} {anioSeleccionado}
    </strong>

    <button
      onClick={() =>
        setMesSeleccionado((prev) =>
          prev === 11 ? 0 : prev + 1
        )
      }
      style={mesBtn}
    >
      ▶
    </button>
  </div>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(7,1fr)",
      gap: "3px",
      marginBottom: "10px",
      textAlign: "center",
      fontSize: "12px",
      color: "#999",
    }}
  >
    <div>L</div>
    <div>M</div>
    <div>X</div>
    <div>J</div>
    <div>V</div>
    <div>S</div>
    <div>D</div>
  </div>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(7,1fr)",
      gap: "6px",
    }}
  >
    {Array.from({ length: offset }).map((_, i) => (
      <div key={`empty-${i}`} />
    ))}

    {Array.from({ length: diasMes }, (_, i) => {
      const dia = i + 1;

      const pasado =
        anioSeleccionado === hoy.getFullYear() &&
        mesSeleccionado === hoy.getMonth() &&
        dia < hoy.getDate();

      const fechaActual =
  `${anioSeleccionado}-${String(
    mesSeleccionado + 1
  ).padStart(2, "0")}-${String(
    dia
  ).padStart(2, "0")}`;

const reservado =
  fechasReservadas.includes(
    fechaActual
  );

const disponible =
  publicacion.disponibilidad_total
    ? !reservado
    : fechasDisponibles.includes(
        fechaActual
      ) && !reservado;

      return (
        <div
          key={dia}
          style={{
            height: "36px",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            background: pasado
  ? "#555"
  : reservado
  ? "#8B0000"
  : disponible
  ? "#1f7a1f"
  : "#8B0000",
            color: "white",
          }}
        >
          {dia}
        </div>
      );
    })}
  </div>
</section>

       
      </div>
<Link
  
  href={`/reservar/${id}`}
  style={{
    position: "fixed",
    bottom: "80px",
    left: "12px",
    right: "12px",
    background: "#FF7A00",
    color: "white",
    textAlign: "center",
    padding: "16px",
    fontWeight: "bold",
    textDecoration: "none",
    borderRadius: "12px",
    zIndex: 1000,
    boxSizing: "border-box",
  }}

>
  RESERVAR
</Link>
      {/* FOOTER */}

      <footer
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: "70px",
          background: "#0D1F3D",
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          boxShadow:
            "0 -4px 12px rgba(0,0,0,0.4)",
        }}
      >
        <Link
          href="/"
          style={{
            color: "white",
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          🏠 Home
        </Link>

        <Link
          href="/perfil"
          style={{
            color: "white",
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          👤 {usuarioActual}
        </Link>
      </footer>
    </main>
  );
}

const cardStyle = {
  background: "#111111",
  borderRadius: "16px",
  padding: "16px",
};

const titleStyle = {
  color: "#FF7A00",
  marginBottom: "10px",
};

const badgeStyle = {
  background: "#0D1F3D",
  border: "1px solid #FF7A00",
  borderRadius: "999px",
  padding: "8px 12px",
};

const mesBtn = {
  background: "#FF7A00",
  border: "none",
  color: "white",
  width: "36px",
  height: "36px",
  borderRadius: "8px",
  cursor: "pointer",
};