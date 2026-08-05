import { supabase } from "./supabase";
import { sendEmail } from "./sendEmail";

export async function enviarEmailNuevaPregunta(
  publicationId: string,
  pregunta: string
) {

  const { data: publicacion, error } =
    await supabase
      .from("publications")
      .select(`
        id,
        titulo,
        owner:profiles!publications_owner_id_fkey (
          nombre,
          email
        )
      `)
      .eq("id", publicationId)
      .single();

  if (error) {
    console.error(error);
    return;
  }

  console.log("DATOS PARA EMAIL:", {
    publicacion,
    pregunta,
  });

}

export async function enviarEmailRespuesta(
  parentId: string,
  respuesta: string
) {
  console.log("Nueva respuesta:", {
    parentId,
    respuesta,
  });
}