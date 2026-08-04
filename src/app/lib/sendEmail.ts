export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const response = await fetch("/api/send-email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to,
      subject,
      html,
    }),
  });

  const resultado = await response.json();

  if (!response.ok) {
    throw new Error(resultado.mensaje || "No se pudo enviar el email.");
  }

  return resultado;
}