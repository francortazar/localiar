type Props = {
  data: {
    nombre: string;
    total: number;
  }[];
};

export default function CategoryInterestTable({ data }: Props) {
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
        📂 Intereses por categoría
      </h2>

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
                textAlign: "right",
                paddingBottom: "10px",
              }}
            >
              Puntaje
            </th>
          </tr>
        </thead>

        <tbody>
          {data.map((categoria) => (
            <tr key={categoria.nombre}>
              <td
                style={{
                  padding: "8px 0",
                }}
              >
                {categoria.nombre}
              </td>

              <td
                style={{
                  textAlign: "right",
                }}
              >
                {categoria.total}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}