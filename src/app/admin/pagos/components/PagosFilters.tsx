"use client";

export default function PagosFilters() {
  return (
    <div
      style={{
        display: "flex",
        gap: "15px",
        flexWrap: "wrap",
        marginBottom: "25px",
      }}
    >
      <select
        style={{
          background: "#111",
          color: "#FFFFFF",
          border: "1px solid #333",
          padding: "10px",
          borderRadius: "8px",
        }}
      >
        <option>Estado</option>
        <option>Pendiente</option>
        <option>Lista para pagar</option>
        <option>Transferida</option>
        <option>Finalizada</option>
      </select>

      <select
        style={{
          background: "#111",
          color: "#FFFFFF",
          border: "1px solid #333",
          padding: "10px",
          borderRadius: "8px",
        }}
      >
        <option>Tipo</option>
        <option>Pago propietario</option>
        <option>Fondo de resguardo</option>
        <option>Reembolso</option>
      </select>

      <input
        placeholder="Buscar..."
        style={{
          background: "#111",
          color: "#FFFFFF",
          border: "1px solid #333",
          padding: "10px",
          borderRadius: "8px",
          flex: 1,
          minWidth: "220px",
        }}
      />
    </div>
  );
}