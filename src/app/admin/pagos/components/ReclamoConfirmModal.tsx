"use client";

export default function ReclamoConfirmModal({
  tipo,
  monto,
  propietario,
  alias,
  inquilino,
  telefono,
  onAceptar,
  onCancelar,
}: {
  tipo: "aprobar" | "rechazar";
  monto: number;
  propietario?: string;
  alias?: string | null;
  inquilino?: string;
  telefono?: string;
  onAceptar: () => void;
  onCancelar: () => void;
}) {
  const esAprobacion = tipo === "aprobar";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 10000,
      }}
      onClick={onCancelar}
    >
      <div
        style={{
          background: "#171717",
          border: "1px solid #333",
          borderRadius: "14px",
          padding: "28px",
          width: "90%",
          maxWidth: "450px",
          color: "#FFFFFF",
          textAlign: "center",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ marginTop: 0 }}>
          {esAprobacion ? "Aprobar reclamo" : "Rechazar reclamo"}
        </h3>

        {esAprobacion ? (
          <>
            <p style={{ lineHeight: "1.7", color: "#CCCCCC" }}>
              Transferir{" "}
              <strong style={{ color: "#FFFFFF" }}>${monto}</strong>{" "}
              a{" "}
              <strong style={{ color: "#FFFFFF" }}>
                {propietario || "Propietario"}
              </strong>
            </p>

            <p style={{ color: "#CCCCCC" }}>Cuenta / alias:</p>

            <div
              style={{
                background: "#0d0d0d",
                border: "1px solid #333",
                borderRadius: "8px",
                padding: "12px",
                marginBottom: "24px",
                fontWeight: "bold",
              }}
            >
              {alias || "Alias no disponible"}
            </div>
          </>
        ) : (
          <>
            <p style={{ lineHeight: "1.7", color: "#CCCCCC" }}>
              Devolver el monto de resguardo de{" "}
              <strong style={{ color: "#FFFFFF" }}>${monto}</strong>{" "}
              a{" "}
              <strong style={{ color: "#FFFFFF" }}>
                {inquilino || "Inquilino"}
              </strong>.
            </p>

            <p style={{ lineHeight: "1.7", color: "#CCCCCC" }}>
              Comunicate al{" "}
              <strong style={{ color: "#FFFFFF" }}>
                {telefono || "Teléfono no disponible"}
              </strong>{" "}
              para coordinar la transferencia.
            </p>
          </>
        )}

        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "center",
          }}
        >
          <button
            onClick={onCancelar}
            style={{
              background: "#333",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "7px",
              padding: "10px 18px",
              cursor: "pointer",
            }}
          >
            Cancelar
          </button>

          <button
            onClick={onAceptar}
            style={{
              background: esAprobacion ? "#1f7a3f" : "#8b2c2c",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "7px",
              padding: "10px 18px",
              cursor: "pointer",
            }}
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}