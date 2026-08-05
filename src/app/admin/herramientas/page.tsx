"use client";

import { createNotification } from "../../lib/createNotification";
import { sendEmail } from "../../lib/sendEmail";

import { procesarPagoConfirmado } from "../../lib/procesarPagoConfirmado";
import { enviarEmailsCancelacion } from "../../lib/enviarEmailsCancelacion";

export default function HerramientasPage() {

    async function probarEmailCancelacion() {
  try {

    await enviarEmailsCancelacion(
      "ACA_OPERACION_ID_DE_PRUEBA"
    );

    alert("Emails enviados");

  } catch(error) {

    console.error(error);

    alert("Error enviando emails");

  }
}

    async function crearNotificacionPrueba() {
  await createNotification({
    userId: "0f599afc-179b-4cb3-81d6-9a0cf57d3fd3",
    titulo: "Prueba de notificación",
    mensaje:
      "Esta notificación fue creada desde el Centro de herramientas.",
    tipo: "test",
    link: "/perfil",
  });

  alert("Notificación creada correctamente.");
}

async function probarApiEmail() {
  try {
    const resultado = await sendEmail({
      to: "franciscocortazar02@gmail.com",
      subject: "Prueba de Localiar",
      html: `
        <h2>¡Hola!</h2>

        <p>
          Este correo fue enviado utilizando la función <strong>sendEmail()</strong>.
        </p>
      `,
    });

    alert(JSON.stringify(resultado));
  } catch (error) {
    console.error(error);
    alert("Error enviando email.");
  }
}


async function probarEnviarEmailsReserva() {
  try {
    await procesarPagoConfirmado(
  "5b6897f5-a4d3-4c10-a5cf-adb2674dfb49"
);

    alert("Consulta realizada. Revisá la consola.");
  } catch (error) {
    console.error(error);
    alert("Error.");
  }
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

      <h1
        style={{
          color: "#FF7A00",
          marginBottom: "10px",
        }}
      >
        Centro de herramientas de administración
      </h1>

      <p
        style={{
          color: "#999",
          marginBottom: "40px",
        }}
      >
        Utilidades internas para probar nuevas funciones antes de incorporarlas al funcionamiento de Localiar.
      </p>

      <div
  style={{
    background: "#111",
    border: "1px solid #222",
    borderRadius: "12px",
    padding: "20px",
    marginTop: "30px",
  }}
>
  <h2
    style={{
      color: "#FFFFFF",
      marginTop: 0,
      marginBottom: "20px",
    }}
  >
    Notificaciones
  </h2>

  

  



<button
  onClick={probarEnviarEmailsReserva}
  style={{
    background: "#dc2626",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "10px 18px",
    cursor: "pointer",
    fontWeight: "bold",
    marginLeft: "10px",
  }}
>
  Probar consulta reserva
</button>
</div>
    </main>
  );
}