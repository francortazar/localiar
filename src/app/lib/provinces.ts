import { supabase } from "./supabase";

export async function obtenerProvincias() {
  const { data, error } = await supabase
    .from("provinces")
    .select("id, nombre")
    .eq("activo", true)
    .order("nombre");

  if (error) {
    console.error(error);
    return [];
  }

  return data;
}