export default function PaymentSummary({
  pagos,
}: {
  pagos: any[];
}) {

    const cantidadOperaciones = pagos.length;

const montoTotal = pagos.reduce(
  (total, pago) => total + Number(pago.amount || 0),
  0
);

const totalComisiones = pagos.reduce(
  (total, pago) => {
    const precioBase =
      Number(pago.amount || 0) / 1.075;

    const cobraPropietario =
      precioBase * 0.925;

    const comisionLocaliar =
      Number(pago.amount || 0) -
      cobraPropietario;

    return total + comisionLocaliar;
  },
  0
);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "20px",
        marginBottom: "30px",
      }}
    >
      <div
        style={{
          background: "#111",
          borderRadius: "12px",
          padding: "20px",
          border: "1px solid #222",
        }}
      >
        <div
          style={{
            color: "#999",
            fontSize: "14px",
            marginBottom: "10px",
          }}
        >
          Operaciones realizadas
        </div>

        <div
          style={{
            fontSize: "34px",
            fontWeight: "bold",
          }}
        >
          {cantidadOperaciones}
        </div>
      </div>

      <div
        style={{
          background: "#111",
          borderRadius: "12px",
          padding: "20px",
          border: "1px solid #222",
        }}
      >
        <div
          style={{
            color: "#999",
            fontSize: "14px",
            marginBottom: "10px",
          }}
        >
          Monto ingresado total
        </div>

        

        <div
          style={{
            fontSize: "34px",
            fontWeight: "bold",
          }}
        >
          $
{montoTotal.toLocaleString("es-AR")}
        </div>
      </div>

<div
        style={{
          background: "#111",
          borderRadius: "12px",
          padding: "20px",
          border: "1px solid #222",
        }}
      >
        <div
          style={{
            color: "#999",
            fontSize: "14px",
            marginBottom: "10px",
          }}
        >
          Comisiones Localiar
        </div>

        

        <div
          style={{
            fontSize: "34px",
            fontWeight: "bold",
          }}
        >
          $
$
{totalComisiones.toLocaleString("es-AR", {
  maximumFractionDigits: 0,
})}
        </div>
      </div>

    </div>
  );
}