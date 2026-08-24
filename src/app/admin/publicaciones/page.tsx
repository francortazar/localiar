import { supabase } from "../../lib/supabase";

export async function enviarEmailPublicacionVencida(
  publicationId: string
) {
  const { data, error } = await supabase
    .from("publications")
    .select(`
      titulo,
      profiles!publications_owner_id_fkey (
        nombre,
        email
      )
    `)
    .eq("id", publicationId)
    .single();

  if (error) throw error;

  const propietario = Array.isArray(data.profiles)
    ? data.profiles[0]
    : data.profiles;

  const response = await fetch(
    "/api/enviar-publicacion-vencida",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nombre: propietario?.nombre,
        email: propietario?.email,
        titulo: data.titulo,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("No se pudo enviar el email");
  }
}
export default function PublicacionesPage() {
  return null;
}