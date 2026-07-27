type Props = {
  data: {
    nombre: string;
    total: number;
  }[];
};

export default function ProvinceInterestTable({ data }: Props) {
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
        📍 Intereses por provincia
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
              Provincia
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
          {data.map((provincia) => (
            <tr key={provincia.nombre}>
              <td
                style={{
                  padding: "8px 0",
                }}
              >
                {provincia.nombre}
              </td>

              <td
                style={{
                  textAlign: "right",
                }}
              >
                {provincia.total}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}