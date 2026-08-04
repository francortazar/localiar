export default function PaymentsTable({
  pagos,
}: {
  pagos: any[];
}) {
  return (
    <div
      style={{
        background: "#111",
        border: "1px solid #222",
        borderRadius: "12px",
        padding: "20px",
      }}
    >
      <h2
        style={{
          margin: "0 0 20px 0",
          color: "#FFFFFF",
          fontSize: "22px",
        }}
      >
        Últimos pagos
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "170px 120px 140px 140px 160px 1fr 1fr 1fr",
          gap: "15px",
          fontWeight: "bold",
          color: "#FF7A00",
          paddingBottom: "12px",
          borderBottom: "1px solid #222",
          marginBottom: "15px",
        }}
      >
        <div
  style={{
    borderRight: "1px solid #222",
    paddingRight: "10px",
  }}
>
  Fecha y hora
</div>
        <div style={{
  borderRight: "1px solid #222",
  paddingRight: "10px",
}}>Estado</div>
        <div style={{
  borderRight: "1px solid #222",
  paddingRight: "10px",
}}>Monto incluye comision</div>
        <div style={{
  borderRight: "1px solid #222",
  paddingRight: "10px",
}}>Comisión Localiar</div>
        <div style={{
  borderRight: "1px solid #222",
  paddingRight: "10px",
}}>Método</div>
        <div style={{
  borderRight: "1px solid #222",
  paddingRight: "10px",
}}>Usuario</div>
        <div style={{
  borderRight: "1px solid #222",
  paddingRight: "10px",
}}>Propietario</div>
        <div style={{
  
  paddingRight: "10px",
}}>Publicación</div>
      </div>

      {pagos.length === 0 ? (
  <p
    style={{
      color: "#999",
      margin: 0,
    }}
  >
    Todavía no hay pagos registrados.
  </p>
) : (
  pagos.map((pago) => {
  const precioBase =
    Number(pago.amount) / 1.075;

  const cobraPropietario =
    precioBase * 0.925;

  const comisionLocaliar =
    Number(pago.amount) -
    cobraPropietario;

  return (
    <div
      key={pago.id}
      style={{
        display: "grid",
        gridTemplateColumns:
  "170px 120px 140px 140px 160px 1fr 1fr 1fr",
        gap: "15px",
        padding: "12px 0",
        borderBottom: "1px solid #222",
        color: "white",
      }}
    >
      <div>
        {new Date(
          pago.created_at
        ).toLocaleString("es-AR")}
      </div>

      <div>
        {pago.status}
      </div>

      <div>
        $
        {Number(
          pago.amount
        ).toLocaleString("es-AR")}
      </div>

      <div>
  $
  {comisionLocaliar.toLocaleString(
    "es-AR",
    {
      maximumFractionDigits: 0,
    }
  )}
</div>

      <div>
        {pago.payment_method}
      </div>

      <div>
  {pago.tenant?.nombre || "Sin usuario"}
</div>

      <div>
  {pago.owner?.nombre || "Sin propietario"}
</div>

      <div>
  {pago.publications?.titulo || "Sin publicación"}
</div>

        </div>
  );
})
)}
    </div>
  );
}