import { supabase } from "./supabase";


export async function obtenerMercadosFavoritosUsuario() 

{


  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
  .from("user_market_interests")
  .select(`
    score,
    category_id,
    province_id,
    categories (
      nombre
    ),
    provinces (
      nombre
    )
  `)
  .eq("user_id", user.id)
  .order("score", {
    ascending: false,
  });

  if (error) {
    console.error(error);
    return [];
  }

 const mercados = data ?? [];

console.log(
  "Mercados favoritos:",
  mercados
);
console.log(
  "PRIMER MERCADO:",
  mercados[0]
);

return mercados;
}
export async function obtenerPublicidadSegmentada() {

  const mercados = await obtenerMercadosFavoritosUsuario();


  const { data, error } = await supabase
    .from("advertising_campaigns")
    .select(`
      *,
      campaign_categories (
        category_id
      ),
      campaign_provinces (
        province_id
      )
    `)
    .eq("status", "active");


  if (error) {
    console.error(error);
    return [];
  }


  console.log(
    "PUBLICIDADES ACTIVAS:",
    data
  );


  return data || [];
}

export async function seleccionarPublicidadParaUsuario(
  filters: any
) {

  const publicidades = await obtenerPublicidadSegmentada();


  if (!publicidades.length) {
    return null;
  }

const publicidadesConBanner = publicidades.filter(
  (p:any) => p.banner_url
);

  const generales = publicidadesConBanner.filter(
  (publicidad: any) => {

    const categorias =
      publicidad.campaign_categories?.map(
        (c:any) => c.category_id
      ) || [];

    const provincias =
      publicidad.campaign_provinces?.map(
        (p:any) => p.province_id
      ) || [];

    return (
      categorias.includes(null) &&
      provincias.includes(null)
    );
  }
);


  let disponibles = [];


  // SIN FILTROS
  if (
    !filters?.categoria &&
    !filters?.provincia
  ) {

    disponibles = generales;

  }


  // CATEGORIA + PROVINCIA
  else if (
    filters?.categoria &&
    filters?.provincia
  ) {

    disponibles = publicidadesConBanner.filter(
      (publicidad: any) => {

        const categorias =
          publicidad.campaign_categories?.map(
            (c:any)=>c.category_id
          ) || [];

        const provincias =
          publicidad.campaign_provinces?.map(
            (p:any)=>p.province_id
          ) || [];


        return (
          categorias.includes(filters.categoria) &&
          provincias.includes(filters.provincia)
        );

      }
    );

  }


  // SOLO CATEGORIA
else if (
  filters?.categoria
) {

  disponibles = publicidadesConBanner.filter(
    (publicidad:any)=> {

      const categorias =
        publicidad.campaign_categories?.map(
          (c:any) => c.category_id
        ) || [];


      return categorias.includes(
        filters.categoria
      );

    }
  );

}


  // SOLO PROVINCIA
  else if (
    filters?.provincia
  ) {

    disponibles = publicidadesConBanner.filter(
      (publicidad:any)=> {

        const provincias =
          publicidad.campaign_provinces?.map(
            (p:any)=>p.province_id
          ) || [];


        return provincias.includes(
          filters.provincia
        );

      }
    );

  }


  // SI NO HAY COINCIDENCIA
// VOLVER A GENERALES

if (!disponibles.length) {
  disponibles = generales;
}


  const publicidadElegida =
  disponibles[
    Math.floor(
      Math.random() * disponibles.length
    )
  ];


  console.log(
    "Filtros actuales:",
    filters
  );

  console.log(
    "Publicidades elegidas:",
    disponibles
  );

  console.log(
    "Publicidad final:",
    publicidadElegida
  );


  return publicidadElegida;
}