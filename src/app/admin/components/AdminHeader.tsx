"use client";

type Props = {
  nombre: string;
};

export default function AdminHeader({ nombre }: Props) {
  const fecha = new Date().toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div
      style={{
        marginBottom: "35px",
      }}
    >
      <h1
        style={{
          color: "#FF7A00",
          margin: 0,
          fontSize: "34px",
        }}
      >
        🛡 Localiar Administración
      </h1>

      <h2
        style={{
          marginTop: "18px",
          marginBottom: "8px",
        }}
      >
        Hola, {nombre} 👋
      </h2>

      <p
        style={{
          color: "#999",
          margin: 0,
        }}
      >
        {fecha}
      </p>
    </div>
  );
}