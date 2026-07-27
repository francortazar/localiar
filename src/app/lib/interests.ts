import { supabase } from "./supabase";

export async function registrarInteresCategoria(categoryId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { data } = await supabase
    .from("user_category_interests")
    .select("id, score")
    .eq("user_id", user.id)
    .eq("category_id", categoryId)
    .maybeSingle();

  if (!data) {
    await supabase.from("user_category_interests").insert({
      user_id: user.id,
      category_id: categoryId,
      score: 1,
    });

    return;
  }

  await supabase
    .from("user_category_interests")
    .update({
      score: data.score + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", data.id);
}

export async function registrarInteresProvincia(provinceId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { data } = await supabase
    .from("user_province_interests")
    .select("id, score")
    .eq("user_id", user.id)
    .eq("province_id", provinceId)
    .maybeSingle();

  if (!data) {
    await supabase.from("user_province_interests").insert({
      user_id: user.id,
      province_id: provinceId,
      score: 1,
    });

    return;
  }

  await supabase
    .from("user_province_interests")
    .update({
      score: data.score + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", data.id);
}

export async function registrarInteresMercado(
  categoryId: string,
  provinceId: string
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { data } = await supabase
    .from("user_market_interests")
    .select("id, score")
    .eq("user_id", user.id)
    .eq("category_id", categoryId)
    .eq("province_id", provinceId)
    .maybeSingle();

  if (!data) {
    await supabase.from("user_market_interests").insert({
      user_id: user.id,
      category_id: categoryId,
      province_id: provinceId,
      score: 1,
    });

    return;
  }

  await supabase
    .from("user_market_interests")
    .update({
      score: data.score + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", data.id);
}