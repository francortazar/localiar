export default function PaymentFilters({
  fechaDesde,
  setFechaDesde,
  fechaHasta,
  setFechaHasta,
}: {
  fechaDesde: string;
  setFechaDesde: (valor: string) => void;
  fechaHasta: string;
  setFechaHasta: (valor: string) => void;
}) {

  return (
    <div
      style={{
        background: "#111",
        border: "1px solid #222",
        borderRadius: "12px",
        padding: "20px",
        marginBottom: "20px",
      }}
    >
      <h2
        style={{
          margin: "0 0 20px 0",
          color: "#FFFFFF",
          fontSize: "22px",
        }}
      >
        Filtros
      </h2>

      <div
  style={{
    display: "flex",
    gap: "20px",
    flexWrap: "wrap",
  }}
>
  <div>
    <label
      style={{
        display: "block",
        color: "#999",
        marginBottom: "8px",
      }}
    >
      Desde
    </label>

    <input
      type="date"
      value={fechaDesde}
      onChange={(e) =>
        setFechaDesde(e.target.value)
      }
      style={{
        padding: "10px",
        borderRadius: "8px",
        border: "none",
      }}
    />
  </div>

  <div>
    <label
      style={{
        display: "block",
        color: "#999",
        marginBottom: "8px",
      }}
    >
      Hasta
    </label>

    <input
      type="date"
      value={fechaHasta}
      onChange={(e) =>
        setFechaHasta(e.target.value)
      }
      style={{
        padding: "10px",
        borderRadius: "8px",
        border: "none",
      }}
    />
  </div>

  <button
  onClick={() => {
    setFechaDesde("");
    setFechaHasta("");
  }}
  style={{
    marginTop: "20px",
    background: "transparent",
    color: "#FF7A00",
    border: "1px solid #FF7A00",
    borderRadius: "8px",
    padding: "10px 16px",
    cursor: "pointer",
    fontWeight: "bold",
  }}
>
  Limpiar filtros
</button>
</div>
    </div>
  );
}