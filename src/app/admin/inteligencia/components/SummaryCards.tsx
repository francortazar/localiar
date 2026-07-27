type Props = {
  totalViews: number;
};

export default function SummaryCards({ totalViews }: Props) {
  return (
    <div
      style={{
        marginTop: "30px",
        padding: "20px",
        borderRadius: "10px",
        background: "#1f1f1f",
        border: "1px solid #333",
        maxWidth: "350px",
      }}
    >
      <h3
        style={{
          margin: 0,
          color: "#FFFFFF",
        }}
      >
        👁 Visualizaciones registradas
      </h3>

      <p
        style={{
          fontSize: "32px",
          fontWeight: "bold",
          margin: "15px 0 0",
          color: "#4CAF50",
        }}
      >
        {totalViews}
      </p>
    </div>
  );
}