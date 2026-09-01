"use client";

import { useState } from "react";
import { useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function ContactoPage() {
  const [pestana, setPestana] = useState("legales");

  const [nombre, setNombre] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState("");

const [usuarioDenunciado, setUsuarioDenunciado] = useState("");
const [publicacionDenunciada, setPublicacionDenunciada] = useState("");
const [motivoDenuncia, setMotivoDenuncia] = useState("");
const [enviandoDenuncia, setEnviandoDenuncia] = useState(false);
const [mensajeDenuncia, setMensajeDenuncia] = useState("");
const [consultaSoporte, setConsultaSoporte] = useState("");
const [enviandoSoporte, setEnviandoSoporte] = useState(false);
const [mensajeSoporte, setMensajeSoporte] = useState("");

const solicitarContacto = async () => {
    setMensaje("");

    if (!nombre || !empresa || !telefono || !email) {
      setMensaje("Completá todos los campos.");
      return;
    }

    try {
      setEnviando(true);

      const { error } = await supabase
        .from("advertising_requests")
        .insert([
          {
            nombre,
            empresa,
            telefono,
            email,
          },
        ]);

      if (error) {
        console.error(error);
        setMensaje("No se pudo enviar la solicitud.");
        return;
      }

      setMensaje("Solicitud enviada correctamente.");

      setNombre("");
      setEmpresa("");
      setTelefono("");
      setEmail("");
    } catch (error) {
      console.error(error);
      setMensaje("Ocurrió un error al enviar la solicitud.");
    } finally {
      setEnviando(false);
    }
  };

    const enviarDenuncia = async () => {
    setMensajeDenuncia("");

    if (!usuarioDenunciado && !publicacionDenunciada) {
      setMensajeDenuncia(
        "Indicá el usuario o la publicación que querés denunciar."
      );
      return;
    }

    if (!motivoDenuncia.trim()) {
      setMensajeDenuncia(
        "Describí brevemente el motivo de la denuncia."
      );
      return;
    }

    try {
      setEnviandoDenuncia(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMensajeDenuncia(
          "Debés iniciar sesión para realizar una denuncia."
        );
        return;
      }

      const { error } = await supabase
        .from("reports")
        .insert([
          {
            denunciante_id: user.id,
            usuario_denunciado:
              usuarioDenunciado.trim() || null,
            publicacion_denunciada:
              publicacionDenunciada.trim() || null,
            motivo: motivoDenuncia.trim(),
          },
        ]);

      if (error) {
        console.error("Error enviando denuncia:", error);
        setMensajeDenuncia(
          "No se pudo enviar la denuncia. Intentá nuevamente."
        );
        return;
      }

      setMensajeDenuncia(
        "La denuncia fue enviada correctamente."
      );

      setUsuarioDenunciado("");
      setPublicacionDenunciada("");
      setMotivoDenuncia("");
    } catch (error) {
      console.error(error);
      setMensajeDenuncia(
        "Ocurrió un error al enviar la denuncia."
      );
    } finally {
      setEnviandoDenuncia(false);
    }
  };

  const enviarConsultaSoporte = async () => {
  setMensajeSoporte("");

  if (!consultaSoporte.trim()) {
    setMensajeSoporte("Escribí tu consulta antes de enviarla.");
    return;
  }

  try {
    setEnviandoSoporte(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMensajeSoporte(
        "Debés iniciar sesión para enviar una consulta."
      );
      return;
    }

    const { error } = await supabase
      .from("support_requests")
      .insert([
        {
          usuario_id: user.id,
          consulta: consultaSoporte.trim(),
        },
      ]);

    if (error) {
      console.error(
        "Error enviando consulta de soporte:",
        error
      );

      setMensajeSoporte(
        "No se pudo enviar la consulta. Intentá nuevamente."
      );

      return;
    }

    setMensajeSoporte(
      "Tu consulta fue enviada correctamente al equipo de soporte."
    );

    setConsultaSoporte("");
  } catch (error) {
    console.error(error);

    setMensajeSoporte(
      "Ocurrió un error al enviar la consulta."
    );
  } finally {
    setEnviandoSoporte(false);
  }
};

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#000",
        color: "white",
        padding: "30px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
        }}
      >
        <button
          onClick={() => {
            window.location.href = "/perfil";
          }}
          style={{
            background: "transparent",
            border: "1px solid #333",
            color: "white",
            padding: "10px 16px",
            borderRadius: "8px",
            cursor: "pointer",
            marginBottom: "30px",
          }}
        >
          ← Volver al perfil
        </button>

        <h1
          style={{
            marginBottom: "30px",
          }}
        >
          Contacto
        </h1>

        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            borderBottom: "1px solid #333",
            marginBottom: "30px",
          }}
        >
          <button
            onClick={() => setPestana("legales")}
            style={{
              background:
                pestana === "legales" ? "#FF7A00" : "#222",
              color: "white",
              border: "none",
              borderRadius: "10px 10px 0 0",
              padding: "14px 20px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Legales
          </button>

          <button
            onClick={() => setPestana("publicidad")}
            style={{
              background:
                pestana === "publicidad" ? "#FF7A00" : "#222",
              color: "white",
              border: "none",
              borderRadius: "10px 10px 0 0",
              padding: "14px 20px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Departamento publicitario
          </button>

          <button
            onClick={() => setPestana("denuncias")}
            style={{
              background:
                pestana === "denuncias" ? "#FF7A00" : "#222",
              color: "white",
              border: "none",
              borderRadius: "10px 10px 0 0",
              padding: "14px 20px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Denuncias
          </button>

          <button
            onClick={() => setPestana("soporte")}
            style={{
              background:
                pestana === "soporte" ? "#FF7A00" : "#222",
              color: "white",
              border: "none",
              borderRadius: "10px 10px 0 0",
              padding: "14px 20px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Soporte
          </button>
        </div>

        <div
          style={{
            background: "#111",
            borderRadius: "12px",
            padding: "30px",
            minHeight: "250px",
          }}
        >
          {pestana === "legales" && (
  <div
    style={{
      lineHeight: "1.7",
      color: "#ddd",
    }}
  >
    <h2
      style={{
        color: "white",
        marginBottom: "25px",
      }}
    >
      Términos y condiciones de uso
    </h2>

    <p>
      El acceso y utilización de Localiar implica la aceptación
      de los presentes términos y condiciones. Si una persona no
      está de acuerdo con alguna de las disposiciones aquí
      establecidas, deberá abstenerse de utilizar la plataforma.
    </p>

    <h3>1. Edad mínima para utilizar Localiar</h3>

    <p>
      Localiar está destinado exclusivamente a personas mayores
      de 18 años. Al registrarse, publicar, contratar, reservar,
      efectuar pagos o utilizar cualquier funcionalidad de la
      plataforma, el usuario declara que tiene al menos 18 años
      de edad y capacidad legal suficiente para celebrar acuerdos
      y asumir las obligaciones derivadas de sus actos.
    </p>

    <p>
      Localiar no está destinado a menores de edad. El usuario es
      responsable de proporcionar información verdadera respecto
      de su edad y de impedir que terceros menores de edad utilicen
      su cuenta.
    </p>

    <h3>2. Naturaleza de las operaciones realizadas mediante Localiar</h3>

    <p>
      Las operaciones realizadas entre propietarios e inquilinos a
      través de Localiar no constituyen contratos de alquiler,
      locación de inmuebles ni contratos de arrendamiento.
    </p>

    <p>
      Las operaciones publicadas y contratadas mediante la
      plataforma corresponden a acuerdos de prestación de servicios
      entre las partes, conforme a las características, condiciones,
      fechas, precios y demás información informada en cada
      publicación.
    </p>

    <p>
      El usuario reconoce que Localiar no es parte del acuerdo
      celebrado entre el propietario y el inquilino y que la
      plataforma funciona como intermediaria tecnológica para
      facilitar el contacto, la publicación, la reserva y los
      mecanismos de pago o gestión asociados a dichas operaciones.
    </p>

    <h3>3. Localiar como intermediario</h3>

    <p>
      Localiar actúa exclusivamente como intermediario entre los
      usuarios. La plataforma facilita herramientas tecnológicas
      para que propietarios e inquilinos puedan encontrarse,
      comunicarse, contratar servicios y gestionar determinadas
      operaciones.
    </p>

    <p>
      El acuerdo comercial y operativo respecto del servicio
      contratado se celebra directamente entre el propietario y el
      inquilino. Cada parte es responsable de cumplir las
      obligaciones que haya asumido frente a la otra.
    </p>

    <p>
      Localiar no garantiza que un propietario o inquilino cumpla
      todas las obligaciones asumidas fuera de las funcionalidades
      y procedimientos expresamente establecidos por la plataforma.
    </p>

    <h3>4. Responsabilidad de los propietarios</h3>

    <p>
      Toda persona que publique un servicio en Localiar declara,
      bajo su exclusiva responsabilidad, que posee las autorizaciones,
      habilitaciones, permisos, documentación, registros, seguros y
      demás requisitos que pudieran resultar exigibles para la
      actividad que ofrece.
    </p>

    <p>
      Al publicar una oferta, el propietario declara que la actividad
      ofrecida se encuentra habilitada y que mantiene toda la
      documentación correspondiente vigente y en regla.
    </p>

    <p>
      Localiar podrá solicitar documentación adicional cuando lo
      considere necesario y podrá suspender o retirar publicaciones
      cuando detecte información presuntamente falsa, irregular,
      incompleta o incompatible con las condiciones de uso de la
      plataforma.
    </p>

    <h3>5. Legalidad de las actividades</h3>

    <p>
      Localiar solamente puede ser utilizado para actividades
      legales. Está estrictamente prohibido utilizar la plataforma
      para ofrecer, contratar, coordinar, facilitar o encubrir
      actividades ilícitas o contrarias a la legislación vigente.
    </p>

    <p>
      Localiar no autoriza, promueve, facilita ni se responsabiliza
      por actividades ilegales realizadas por usuarios mediante la
      plataforma o fuera de ella.
    </p>

    <p>
      Cada usuario es exclusivamente responsable de verificar que
      la actividad que realiza, ofrece o contrata sea legal y cumpla
      con todas las normas nacionales, provinciales, municipales,
      tributarias, comerciales, laborales, administrativas y de
      cualquier otra naturaleza que pudieran resultar aplicables.
    </p>

    <h3>6. Información proporcionada por los usuarios</h3>

    <p>
      Todos los datos proporcionados a Localiar por propietarios e
      inquilinos deben ser verdaderos, completos, actuales y
      verificables.
    </p>

    <p>
      Esto incluye, entre otros, nombre, datos de contacto,
      documentación, información de publicaciones, características
      del servicio, precios, disponibilidad, datos de pago y
      cualquier otra información requerida por la plataforma.
    </p>

    <p>
      El usuario será responsable por cualquier consecuencia derivada
      de información falsa, incompleta, engañosa, desactualizada o
      perteneciente a otra persona.
    </p>

    <h3>7. Responsabilidad de los inquilinos</h3>

    <p>
      El inquilino declara que utilizará los servicios contratados
      exclusivamente para fines legales y de acuerdo con las
      condiciones informadas por el propietario.
    </p>

    <p>
      El inquilino será responsable por los daños, perjuicios,
      incumplimientos, infracciones o consecuencias que pudieran
      derivarse de su conducta durante la prestación del servicio.
    </p>

    <h3>8. Acuerdo entre las partes</h3>

    <p>
      La aceptación de una reserva implica que propietario e
      inquilino aceptan las condiciones informadas para la operación,
      incluyendo fechas, precios, características del servicio y
      demás condiciones publicadas.
    </p>

    <p>
      Localiar no modifica unilateralmente el acuerdo celebrado
      entre las partes, salvo respecto de aquellas cuestiones
      relacionadas exclusivamente con el funcionamiento de la
      plataforma, sus comisiones, mecanismos de pago, políticas de
      cancelación y demás condiciones expresamente informadas.
    </p>

    <h3>9. Precios, comisiones e impuestos</h3>

    <p>
      Localiar solamente percibirá los impuestos, cargos y comisiones
      que se encuentren expresamente informados dentro de la
      plataforma o que correspondan conforme al medio de pago
      utilizado.
    </p>

    <p>
      Los usuarios reconocen que determinados medios de pago,
      entidades financieras, billeteras virtuales, bancos,
      procesadores de pago u otros intermediarios pueden aplicar
      impuestos, percepciones, retenciones, cargos o comisiones
      adicionales sobre determinadas operaciones.
    </p>

    <p>
      Dichos cargos pueden depender del medio de pago elegido, de la
      entidad utilizada, de la situación fiscal del usuario o de
      disposiciones legales vigentes.
    </p>

    <p>
      Localiar no controla ni determina los cargos que terceros
      puedan aplicar sobre una transferencia, depósito, pago,
      acreditación o retiro de fondos, salvo aquellos cargos que
      sean propios de Localiar y que hayan sido expresamente
      informados.
    </p>

    <h3>10. Medios de pago</h3>

    <p>
      Los usuarios aceptan que los pagos realizados mediante
      diferentes medios pueden estar sujetos a condiciones
      particulares establecidas por los proveedores de dichos
      servicios.
    </p>

    <p>
      Antes de realizar una operación, el usuario deberá verificar
      las condiciones, costos y eventuales impuestos aplicables al
      medio de pago seleccionado.
    </p>

    <h3>11. Cancelaciones</h3>

    <p>
      Las cancelaciones estarán sujetas a las condiciones informadas
      por Localiar y a las reglas aplicables a cada operación.
    </p>

    <p>
      Cuando un propietario cancela una o más fechas de una operación,
      las consecuencias económicas serán determinadas de acuerdo con
      las políticas de cancelación vigentes y la información
      registrada para dicha operación.
    </p>

    <p>
      Cuando un inquilino cancela una operación, las consecuencias
      económicas también estarán determinadas por las condiciones
      previamente informadas y aceptadas.
    </p>

    <h3>12. Información de las publicaciones</h3>

    <p>
      Los propietarios son responsables de que las publicaciones
      sean claras, precisas y correspondan efectivamente con el
      servicio ofrecido.
    </p>

    <p>
      Las fotografías, descripciones, precios, características,
      disponibilidad y demás información publicada deben representar
      razonablemente el servicio que será prestado.
    </p>

    <h3>13. Prohibición de información engañosa</h3>

    <p>
      Está prohibido publicar información falsa, engañosa,
      fraudulenta o destinada a inducir a error a otros usuarios.
    </p>

    <p>
      Localiar podrá retirar publicaciones, suspender cuentas o
      adoptar otras medidas cuando existan indicios razonables de
      incumplimiento de estas condiciones.
    </p>

    <h3>14. Uso indebido de la plataforma</h3>

    <p>
      Está prohibido utilizar Localiar para actividades fraudulentas,
      estafas, suplantación de identidad, falsificación documental,
      lavado de activos, comercialización de bienes o servicios
      ilícitos, amenazas, acoso, discriminación, explotación,
      actividades peligrosas o cualquier otra conducta contraria
      a la legislación vigente.
    </p>

    <h3>15. Denuncias y situaciones irregulares</h3>

    <p>
      Los usuarios podrán informar a Localiar sobre publicaciones,
      usuarios o situaciones que consideren contrarias a estas
      condiciones.
    </p>

    <p>
      Localiar podrá analizar la información recibida y adoptar las
      medidas que considere correspondientes dentro de sus
      posibilidades y competencias como plataforma intermediaria.
    </p>

    <h3>16. Datos personales</h3>

    <p>
      Los usuarios deberán proporcionar información personal
      verdadera y mantenerla actualizada cuando sea necesario para
      el correcto funcionamiento de la cuenta y de las operaciones.
    </p>

    <p>
      Los usuarios también deberán respetar la privacidad y los
      datos personales de las demás personas con las que interactúen
      mediante Localiar.
    </p>

    <h3>17. Comunicaciones</h3>

    <p>
      Localiar podrá utilizar los datos de contacto proporcionados
      por los usuarios para enviar comunicaciones relacionadas con
      reservas, cancelaciones, pagos, devoluciones, seguridad,
      funcionamiento de la cuenta, soporte y otras cuestiones
      vinculadas con el servicio.
    </p>

    <h3>18. Suspensión o eliminación de cuentas</h3>

    <p>
      Localiar podrá limitar, suspender o cancelar cuentas cuando
      detecte incumplimientos de estos términos, información falsa,
      actividades ilícitas, conductas fraudulentas, abuso de la
      plataforma o cualquier situación que pueda afectar la
      seguridad o integridad de otros usuarios.
    </p>

    <h3>19. Responsabilidad de cada parte</h3>

    <p>
      Cada usuario es responsable de sus propios actos, decisiones,
      declaraciones, obligaciones y acuerdos realizados mediante
      Localiar.
    </p>

    <p>
      La existencia de una cuenta en Localiar no implica que la
      plataforma garantice la solvencia, conducta, identidad,
      habilitación comercial o cumplimiento futuro de otro usuario,
      salvo las verificaciones específicas que eventualmente
      informe expresamente la plataforma.
    </p>

    <h3>20. Responsabilidad sobre los servicios ofrecidos</h3>

    <p>
      La prestación efectiva del servicio corresponde al propietario
      y la utilización del servicio corresponde al inquilino.
    </p>

    <p>
      Localiar no presta directamente los servicios publicados por
      terceros y no debe interpretarse que la plataforma sea la
      prestadora directa de cada uno de ellos.
    </p>

    <h3>21. Fuerza mayor y situaciones extraordinarias</h3>

    <p>
      Localiar no será responsable por interrupciones, demoras o
      imposibilidad de funcionamiento ocasionadas por hechos que
      excedan razonablemente su control, incluyendo fallas de
      servicios externos, problemas de conectividad, interrupciones
      de proveedores tecnológicos, entidades financieras, servicios
      de pago u otras circunstancias extraordinarias.
    </p>

    <h3>22. Modificaciones de los términos</h3>

    <p>
      Localiar podrá modificar, actualizar o ampliar estos términos
      y condiciones cuando resulte necesario para adaptar la
      plataforma a cambios operativos, tecnológicos, comerciales o
      legales.
    </p>

    <p>
      Las modificaciones serán aplicables desde su publicación o
      desde la fecha que se indique expresamente.
    </p>

    <h3>23. Aceptación</h3>

    <p>
      El registro y utilización de Localiar implica que el usuario
      declara haber leído, comprendido y aceptado estos términos y
      condiciones.
    </p>

    <p>
      Asimismo, el usuario reconoce que el acuerdo principal
      correspondiente a cada operación se celebra entre propietario
      e inquilino, dentro del marco de una prestación de servicios
      lícita, y que Localiar actúa como plataforma intermediaria
      para facilitar dicha relación.
    </p>

    <h3>24. Legislación aplicable</h3>

    <p>
      Las relaciones entre los usuarios y Localiar se regirán por
      la legislación que resulte aplicable según la naturaleza de
      cada situación y la jurisdicción correspondiente.
    </p>

    
  </div>
)}

          {pestana === "publicidad" && (
  <div
    style={{
      lineHeight: "1.7",
      color: "#ddd",
    }}
  >
    <h2
      style={{
        color: "white",
        marginBottom: "15px",
      }}
    >
      Potenciá tu marca con publicidad segmentada
    </h2>

    <p>
      En Localiar desarrollamos espacios publicitarios con una
      estrategia de segmentación orientada a conectar cada marca
      con una audiencia específica y relevante.
    </p>

    <p>
      Nuestro objetivo es que tu empresa pueda alcanzar potenciales
      clientes dentro de un entorno relacionado con sus intereses,
      necesidades y hábitos de consumo, optimizando la visibilidad
      de cada campaña y buscando generar resultados de mayor calidad.
    </p>

    <p>
      Si estás interesado en publicitar tu empresa, producto o
      servicio dentro de Localiar, completá el siguiente formulario
      y un representante de nuestro equipo se pondrá en contacto
      con vos para brindarte información sobre las alternativas
      publicitarias disponibles.
    </p>

    <h3
      style={{
        color: "white",
        marginTop: "30px",
        marginBottom: "20px",
      }}
    >
      Solicitar información publicitaria
    </h3>

    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "15px",
        maxWidth: "600px",
      }}
    >
      <input
        type="text"
        placeholder="Nombre y apellido"
        value={nombre}
onChange={(e) => setNombre(e.target.value)}
        style={{
          padding: "14px",
          borderRadius: "8px",
          border: "1px solid #333",
          background: "#222",
          color: "white",
          fontSize: "16px",
        }}
      />

      <input
        type="text"
        placeholder="Empresa"
        value={empresa}
onChange={(e) => setEmpresa(e.target.value)}
        style={{
          padding: "14px",
          borderRadius: "8px",
          border: "1px solid #333",
          background: "#222",
          color: "white",
          fontSize: "16px",
        }}
      />

      <input
        type="tel"
        placeholder="Teléfono"
        value={telefono}
onChange={(e) => setTelefono(e.target.value)}
        style={{
          padding: "14px",
          borderRadius: "8px",
          border: "1px solid #333",
          background: "#222",
          color: "white",
          fontSize: "16px",
        }}
      />

      <input
        type="email"
        placeholder="Email"
        value={email}
onChange={(e) => setEmail(e.target.value)}
        style={{
          padding: "14px",
          borderRadius: "8px",
          border: "1px solid #333",
          background: "#222",
          color: "white",
          fontSize: "16px",
        }}
      />

      <button
  onClick={solicitarContacto}
  disabled={enviando}
  style={{
    marginTop: "10px",
    padding: "14px",
    borderRadius: "8px",
    border: "none",
    background: "#FF7A00",
    color: "white",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
  }}
>
  {enviando ? "Enviando..." : "Solicitar contacto"}
</button>
{mensaje && (
  <p
    style={{
      marginTop: "10px",
      color: mensaje.includes("correctamente") ? "#4CAF50" : "#ff5555",
    }}
  >
    {mensaje}
  </p>
)}
    </div>
  </div>
)}

          {pestana === "denuncias" && (
  <div
    style={{
      lineHeight: "1.7",
      color: "#ddd",
    }}
  >
    <h2
      style={{
        color: "white",
        marginBottom: "15px",
      }}
    >
      Realizar una denuncia
    </h2>

    <p>
      Podés informar una situación que consideres irregular,
      inapropiada o contraria a las condiciones de uso de Localiar,
      ya sea relacionada con un usuario o con una publicación
      disponible en la plataforma.
    </p>

    <p>
      Nuestro equipo de soporte analizará la información recibida
      y evaluará cada denuncia a la mayor brevedad posible.
    </p>

    <h3
      style={{
        color: "white",
        marginTop: "30px",
        marginBottom: "20px",
      }}
    >
      Información de la denuncia
    </h3>

    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "15px",
        maxWidth: "600px",
      }}
    >
      <input
        type="text"
        placeholder="Nombre de usuario a denunciar"
        value={usuarioDenunciado}
        onChange={(e) =>
          setUsuarioDenunciado(e.target.value)
        }
        style={{
          padding: "14px",
          borderRadius: "8px",
          border: "1px solid #333",
          background: "#222",
          color: "white",
          fontSize: "16px",
        }}
      />

      <input
        type="text"
        placeholder="Nombre de la publicación a denunciar"
        value={publicacionDenunciada}
        onChange={(e) =>
          setPublicacionDenunciada(e.target.value)
        }
        style={{
          padding: "14px",
          borderRadius: "8px",
          border: "1px solid #333",
          background: "#222",
          color: "white",
          fontSize: "16px",
        }}
      />

      <textarea
        placeholder="Describí brevemente el motivo de la denuncia"
        value={motivoDenuncia}
        onChange={(e) => {
          if (e.target.value.length <= 140) {
            setMotivoDenuncia(e.target.value);
          }
        }}
        maxLength={140}
        rows={5}
        style={{
          padding: "14px",
          borderRadius: "8px",
          border: "1px solid #333",
          background: "#222",
          color: "white",
          fontSize: "16px",
          resize: "vertical",
          fontFamily: "inherit",
        }}
      />

      <div
        style={{
          color: "#888",
          fontSize: "14px",
          textAlign: "right",
        }}
      >
        {motivoDenuncia.length}/140
      </div>

      <p
        style={{
          color: "#bbb",
          fontSize: "14px",
          marginTop: "5px",
        }}
      >
        El equipo de soporte evaluará la denuncia a la brevedad
        posible y, de ser necesario, se pondrá en contacto con
        las partes involucradas. Las denuncias son completamente
        anónimas.
      </p>

      <button
        onClick={enviarDenuncia}
        disabled={enviandoDenuncia}
        style={{
          marginTop: "10px",
          padding: "14px",
          borderRadius: "8px",
          border: "none",
          background: "#FF7A00",
          color: "white",
          fontSize: "16px",
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        {enviandoDenuncia
          ? "Enviando..."
          : "Enviar denuncia"}
      </button>

      {mensajeDenuncia && (
        <p
          style={{
            color: mensajeDenuncia.includes("correctamente")
              ? "#4CAF50"
              : "#ff5555",
          }}
        >
          {mensajeDenuncia}
        </p>
      )}
    </div>
  </div>
)}

         {pestana === "soporte" && (
  <div
    style={{
      lineHeight: "1.7",
      color: "#ddd",
    }}
  >
    <h2
      style={{
        color: "white",
        marginBottom: "15px",
      }}
    >
      Contactá al equipo de soporte
    </h2>

    <p>
      Si tenés alguna consulta, duda o necesitás asistencia con el
      funcionamiento de Localiar, podés comunicarte con nuestro
      equipo de soporte.
    </p>

    <p>
      Escribí tu consulta y nuestro equipo la revisará a la brevedad
      posible.
    </p>

    <h3
      style={{
        color: "white",
        marginTop: "30px",
        marginBottom: "20px",
      }}
    >
      Enviar una consulta
    </h3>

    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "15px",
        maxWidth: "600px",
      }}
    >
      <textarea
        placeholder="Escribí tu consulta para el equipo de soporte..."
        value={consultaSoporte}
        onChange={(e) => {
          if (e.target.value.length <= 140) {
            setConsultaSoporte(e.target.value);
          }
        }}
        maxLength={140}
        rows={5}
        style={{
          padding: "14px",
          borderRadius: "8px",
          border: "1px solid #333",
          background: "#222",
          color: "white",
          fontSize: "16px",
          resize: "vertical",
          fontFamily: "inherit",
        }}
      />

      <div
        style={{
          color: "#888",
          fontSize: "14px",
          textAlign: "right",
        }}
      >
        {consultaSoporte.length}/140
      </div>

      <button
        onClick={enviarConsultaSoporte}
        disabled={enviandoSoporte}
        style={{
          marginTop: "10px",
          padding: "14px",
          borderRadius: "8px",
          border: "none",
          background: "#FF7A00",
          color: "white",
          fontSize: "16px",
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        {enviandoSoporte
          ? "Enviando..."
          : "Enviar consulta"}
      </button>

      {mensajeSoporte && (
        <p
          style={{
            color: mensajeSoporte.includes("correctamente")
              ? "#4CAF50"
              : "#ff5555",
          }}
        >
          {mensajeSoporte}
        </p>
      )}
    </div>
  </div>
)}
        </div>
      </div>
    </div>
  );
}