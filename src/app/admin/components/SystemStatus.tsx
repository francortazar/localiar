"use client";

type Props = {
  status: "ok" | "warning" | "error";
  message: string;
};

export default function SystemStatus({
  status,
  message,
}: Props) {
  const config = {
    ok: {
      icon: "🟢",
      title: "Sistema funcionando correctamente",
      border: "#2E7D32",
    },
    warning: {
      icon: "🟠",
      title: "El sistema requiere atención",
      border: "#F9A825",
    },
    error: {
      icon: "🔴",
      title: "Existen tareas críticas",
      border: "#C62828",
    },
  };

  const current = config[status];

  return (
    <div
      style={{
        background: "#111111",
        borderRadius: "18px",
        padding: "20px",
        marginBottom: "25px",
        borderLeft: `6px solid ${current.border}`,
      }}
    >
      <h2
        style={{
          margin: 0,
          marginBottom: "10px",
        }}
      >
        {current.icon} {current.title}
      </h2>

      <p
        style={{
          margin: 0,
          color: "#999",
        }}
      >
        {message}
      </p>
    </div>
  );
}