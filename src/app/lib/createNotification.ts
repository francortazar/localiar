import { supabase } from "./supabase";

type CreateNotificationParams = {
  userId: string;
  titulo: string;
  mensaje: string;
  tipo?: string;
  link?: string;
};

export async function createNotification({
  userId,
  titulo,
  mensaje,
  tipo,
  link,
}: CreateNotificationParams) {
  const { error } = await supabase
    .from("notifications")
    .insert({
      user_id: userId,
      titulo,
      mensaje,
      tipo,
      link,
    });

  if (error) {
    console.error(
      "Error creando notificación:",
      error
    );
  }
}