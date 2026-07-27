import { supabase } from "./supabase";

export async function registrarEventoPublicacion(
  publicationId: string,
  eventType: string,
  source?: string
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("publication_events")
    .insert({
      publication_id: publicationId,
      user_id: user?.id ?? null,
      event_type: eventType,
      source: source ?? null,
    });

  if (error) {
    console.error("Error registrando evento:", error);
  }
}