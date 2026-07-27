import { supabase } from "./supabase";

export async function obtenerCategorias() {
  const { data, error } = await supabase
    .from("categories")
    .select("id, nombre")
    .eq("activo", true)
    .order("nombre");

  if (error) {
    console.error("Error cargando categorías:", error);
    return [];
  }

  return data || [];
}