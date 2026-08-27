export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";

  const response = await fetch(
    `${baseUrl}/api/send-email`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to,
        subject,
        html,
      }),
    }
  );

  const resultado = await response.json();

  if (!response.ok) {
    throw new Error(
      resultado.mensaje ||
        resultado.error ||
        "No se pudo enviar el email."
    );
  }

  return resultado;
}