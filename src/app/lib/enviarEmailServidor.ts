import { Resend } from "resend";

export async function enviarEmailServidor({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error(
      "RESEND_API_KEY no está configurada en el servidor."
    );
  }

  const resend = new Resend(apiKey);

  const { data, error } = await resend.emails.send({
    from: "Localiar <noreply@localiar.com>",
    to,
    subject,
    html,
  });

  if (error) {
    console.error(
      "ERROR RESEND:",
      error
    );

    throw new Error(
      "Resend no pudo enviar el email."
    );
  }

  return data;
}