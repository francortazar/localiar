"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

export function useDashboardStats() {
  const [totalViews, setTotalViews] = useState(0);

  const [categoryStats, setCategoryStats] = useState<
    { nombre: string; total: number }[]
  >([]);

  const [provinceStats, setProvinceStats] = useState<
  { nombre: string; total: number }[]
>([]);

  async function cargarSegmentos() {
  const { data, error } = await supabase
    .from("user_market_interests")
    .select(`
      score,
      categories (
        nombre
      ),
      provinces (
        nombre
      )
    `);

  if (error) {
    console.error(error);
    return;
  }

  const acumulado: Record<string, number> = {};

  data?.forEach((item: any) => {
    const categoria = item.categories?.nombre;
    const provincia = item.provinces?.nombre;

    if (!categoria || !provincia) return;

    const clave = `${categoria}|||${provincia}`;

    acumulado[clave] =
      (acumulado[clave] || 0) + item.score;
  });

  const resultado = Object.entries(acumulado)
    .map(([clave, total]) => {
      const [categoria, provincia] = clave.split("|||");

      return {
        categoria,
        provincia,
        total,
      };
    })
    .sort((a, b) => b.total - a.total);

  setMarketSegments(resultado);
}

  const [marketSegments, setMarketSegments] = useState<
  {
    categoria: string;
    provincia: string;
    total: number;
  }[]
>([]);

  useEffect(() => {
  cargarVisualizaciones();
  cargarCategorias();
  cargarProvincias();
  cargarSegmentos();
}, []);

  async function cargarVisualizaciones() {
    const { count, error } = await supabase
      .from("publication_events")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("event_type", "view");

    if (error) {
      console.error(error);
      return;
    }

    setTotalViews(count ?? 0);
  }

  async function cargarCategorias() {
    const { data, error } = await supabase
      .from("user_category_interests")
      .select(`
        score,
        categories (
          nombre
        )
      `);

    if (error) {
      console.error(error);
      return;
    }

    const acumulado: Record<string, number> = {};

    data?.forEach((item: any) => {
      const nombre = item.categories?.nombre;

      if (!nombre) return;

      acumulado[nombre] = (acumulado[nombre] || 0) + item.score;
    });

    const resultado = Object.entries(acumulado)
      .map(([nombre, total]) => ({
        nombre,
        total,
      }))
      .sort((a, b) => b.total - a.total);

    setCategoryStats(resultado);
  }

  async function cargarProvincias() {
  const { data, error } = await supabase
    .from("user_province_interests")
    .select(`
      score,
      provinces (
        nombre
      )
    `);

  if (error) {
    console.error(error);
    return;
  }

  const acumulado: Record<string, number> = {};

  data?.forEach((item: any) => {
    const nombre = item.provinces?.nombre;

    if (!nombre) return;

    acumulado[nombre] = (acumulado[nombre] || 0) + item.score;
  });

  const resultado = Object.entries(acumulado)
    .map(([nombre, total]) => ({
      nombre,
      total,
    }))
    .sort((a, b) => b.total - a.total);

  setProvinceStats(resultado);
}

  return {
  totalViews,
  categoryStats,
  provinceStats,
  marketSegments,
};
}