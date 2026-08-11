import { Resend } from "resend";

const resend = new Resend(
process.env.RESEND_API_KEY!
);

export async function sendEmail({
to,
subject,
html,
}: {
to: string;
subject: string;
html: string;
}) {
const { data, error } =
await resend.emails.send({
from: "Localiar [onboarding@resend.dev](mailto:onboarding@resend.dev)",
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
  error.message ||
    "No se pudo enviar el email."
);


}

console.log(
"EMAIL ENVIADO:",
data
);

return data;
}
