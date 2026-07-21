type Props = {
  operaciones: any[];
};

export default function PagosResumen({ operaciones }: Props) {
  const pagosPorRealizar = operaciones.length;

  const totalAPagar = operaciones.reduce((total, operacion) => {
    const precio = operacion.publications?.precio_dia || 0;

    return total + precio * 0.925;
  }, 0);

  const sinDestino = operaciones.length;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "20px",
        marginBottom: "30px",
      }}
    >
      <ResumenCard
        titulo="Pagos por realizar"
        valor={pagosPorRealizar}
        color="#ef4444"
      />

      <ResumenCard
        titulo="Total a transferir"
        valor={`$${totalAPagar.toLocaleString("es-AR")}`}
        color="#22c55e"
      />

      <ResumenCard
        titulo="Sin destino"
        valor={sinDestino}
        color="#f59e0b"
      />
    </div>
  );
}

function ResumenCard({
  titulo,
  valor,
  color,
}: {
  titulo: string;
  valor: string | number;
  color: string;
}) {
  return (
    <div
      style={{
        background: "#111",
        borderRadius: "12px",
        padding: "20px",
        borderLeft: `5px solid ${color}`,
      }}
    >
      <div
        style={{
          color: "#999",
          fontSize: "14px",
          marginBottom: "10px",
        }}
      >
        {titulo}
      </div>

      <div
        style={{
          color: "#fff",
          fontSize: "28px",
          fontWeight: 700,
        }}
      >
        {valor}
      </div>
    </div>
  );
}