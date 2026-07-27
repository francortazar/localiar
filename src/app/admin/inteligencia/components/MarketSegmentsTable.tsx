"use client";

import { useEffect, useState } from "react";
import { obtenerCategorias } from "../../../lib/categories";
import { obtenerProvincias } from "../../../lib/provinces";
type Props = {
  data: {
    categoria: string;
    provincia: string;
    total: number;
  }[];
};

export default function MarketSegmentsTable({ data }: Props) {

      const [busqueda, setBusqueda] = useState("");
      const [categorias, setCategorias] = useState<any[]>([]);
const [provincias, setProvincias] = useState<any[]>([]);

const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");
const [provinciaSeleccionada, setProvinciaSeleccionada] = useState("");

useEffect(() => {
  async function cargarDatos() {
    const cats = await obtenerCategorias();
    const provs = await obtenerProvincias();

    setCategorias(cats);
    setProvincias(provs);
  }

  cargarDatos();
}, []);
  return (
    <div
      style={{
        marginTop: "30px",
        background: "#1f1f1f",
        border: "1px solid #333",
        borderRadius: "10px",
        padding: "20px",
      }}
    >
      <h2
        style={{
          color: "#FFFFFF",
          marginTop: 0,
        }}
      >
        🎯 Segmentos de mercado
      </h2>

      <div
  style={{
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "15px",
    marginBottom: "20px",
  }}
>
  <select
    value={categoriaSeleccionada}
    onChange={(e) => setCategoriaSeleccionada(e.target.value)}
    style={{
      padding: "10px",
      borderRadius: "8px",
      background: "#111",
      color: "#FFF",
      border: "1px solid #555",
    }}
  >
    <option value="">Todas las categorías</option>

    {categorias.map((categoria) => (
      <option key={categoria.id} value={categoria.nombre}>
        {categoria.nombre}
      </option>
    ))}
  </select>

  <select
    value={provinciaSeleccionada}
    onChange={(e) => setProvinciaSeleccionada(e.target.value)}
    style={{
      padding: "10px",
      borderRadius: "8px",
      background: "#111",
      color: "#FFF",
      border: "1px solid #555",
    }}
  >
    <option value="">Todas las provincias</option>

    {provincias.map((provincia) => (
      <option key={provincia.id} value={provincia.nombre}>
        {provincia.nombre}
      </option>
    ))}
  </select>
</div>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          color: "#FFFFFF",
        }}
      >
        <thead>
          <tr>
            <th
              style={{
                textAlign: "left",
                paddingBottom: "10px",
              }}
            >
              Categoría
            </th>

            <th
              style={{
                textAlign: "left",
                paddingBottom: "10px",
              }}
            >
              Provincia
            </th>

            <th
              style={{
                textAlign: "right",
                paddingBottom: "10px",
              }}
            >
              Interacciones
            </th>
          </tr>
        </thead>

        <tbody>
          
  {data
  .filter((segmento) => {
    const coincideCategoria =
      !categoriaSeleccionada ||
      segmento.categoria === categoriaSeleccionada;

    const coincideProvincia =
      !provinciaSeleccionada ||
      segmento.provincia === provinciaSeleccionada;

    return coincideCategoria && coincideProvincia;
  })
  .map((segmento, index) => (
            <tr key={index}>
              <td
                style={{
                  padding: "8px 0",
                }}
              >
                {segmento.categoria}
              </td>

              <td
                style={{
                  padding: "8px 0",
                }}
              >
                {segmento.provincia}
              </td>

              <td
                style={{
                  textAlign: "right",
                }}
              >
                {segmento.total}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}