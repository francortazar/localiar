"use client";

import { useState } from "react";

export default function Calendar({
  fechasReservadas,
  fechasDisponibles,
  disponibilidadTotal,
  selectedDates,
  setSelectedDates,
}: any) {
  const hoy = new Date();

  const [mesSeleccionado, setMesSeleccionado] = useState(hoy.getMonth());
  const [anioSeleccionado, setAnioSeleccionado] = useState(hoy.getFullYear());

  const meses = [
    "Enero","Febrero","Marzo","Abril","Mayo","Junio",
    "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
  ];

  const diasMes = new Date(anioSeleccionado, mesSeleccionado + 1, 0).getDate();

  const primerDiaSemana = new Date(anioSeleccionado, mesSeleccionado, 1).getDay();
  const offset = primerDiaSemana === 0 ? 6 : primerDiaSemana - 1;

  const hoyNormalizado = new Date();
  hoyNormalizado.setHours(0, 0, 0, 0);

  const safeSelectedDates = Array.isArray(selectedDates)
    ? selectedDates
    : [];

  function toggleDia(fecha: string) {
    setSelectedDates((prev: any) => {
      const safePrev = Array.isArray(prev) ? prev : [];

      return safePrev.includes(fecha)
        ? safePrev.filter((f: string) => f !== fecha)
        : [...safePrev, fecha];
    });
  }

  return (
    <div>
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button
          onClick={() => {
            if (mesSeleccionado === 0) {
              setMesSeleccionado(11);
              setAnioSeleccionado(anioSeleccionado - 1);
            } else {
              setMesSeleccionado(mesSeleccionado - 1);
            }
          }}
        >
          ◀
        </button>

        <strong>
          {meses[mesSeleccionado]} {anioSeleccionado}
        </strong>

        <button
          onClick={() => {
            if (mesSeleccionado === 11) {
              setMesSeleccionado(0);
              setAnioSeleccionado(anioSeleccionado + 1);
            } else {
              setMesSeleccionado(mesSeleccionado + 1);
            }
          }}
        >
          ▶
        </button>
      </div>

      {/* CALENDARIO */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7,1fr)",
          gap: "6px",
        }}
      >
        {Array.from({ length: offset }).map((_, i) => (
          <div key={i} />
        ))}

        {Array.from({ length: diasMes }, (_, i) => {
          const dia = i + 1;

          const fecha =
  `${anioSeleccionado}-${String(mesSeleccionado + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;

          const fechaObj = new Date(anioSeleccionado, mesSeleccionado, dia);

          const esPasado = fechaObj < hoyNormalizado;

          const reservado = fechasReservadas.includes(fecha);

          const disponible = disponibilidadTotal
            ? !reservado
            : fechasDisponibles.includes(fecha) && !reservado;

          const seleccionado = safeSelectedDates.includes(fecha);

          return (
            <button
              key={dia}
              disabled={esPasado || reservado || !disponible}
              onClick={() => toggleDia(fecha)}
              style={{
                opacity: esPasado ? 0.3 : 1,
                cursor: esPasado ? "not-allowed" : "pointer",
                height: "42px",
                border: "none",
                borderRadius: "8px",
                color: "white",
                fontWeight: "bold",
                background: seleccionado
                  ? "#FF7A00"
                  : disponible
                  ? "#1FAA59"
                  : "#8B0000",
              }}
            >
              {dia}
            </button>
          );
        })}
      </div>
    </div>
  );
}