"use client";

import { useState } from "react";

export default function ImageViewer({
  images,
  onClose,
}: {
  images: string[];
  onClose: () => void;
}) {
  const [indiceActual, setIndiceActual] = useState(0);

  const anterior = () => {
    setIndiceActual((indice) =>
      indice === 0 ? images.length - 1 : indice - 1
    );
  };

  const siguiente = () => {
    setIndiceActual((indice) =>
      indice === images.length - 1 ? 0 : indice + 1
    );
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.9)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: "relative",
          maxWidth: "90vw",
          maxHeight: "90vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={images[indiceActual]}
          alt={`Imagen ${indiceActual + 1} del reclamo`}
          style={{
            maxWidth: "90vw",
            maxHeight: "85vh",
            borderRadius: "12px",
          }}
        />

        <button
          onClick={onClose}
          style={{
            position: "fixed",
            top: "25px",
            right: "30px",
            background: "transparent",
            border: "none",
            color: "#FFFFFF",
            fontSize: "30px",
            cursor: "pointer",
          }}
        >
          ✕
        </button>

        {images.length > 1 && (
          <>
            <button
              onClick={anterior}
              style={{
                position: "fixed",
                left: "30px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "rgba(0,0,0,0.6)",
                border: "1px solid #555",
                borderRadius: "50%",
                width: "50px",
                height: "50px",
                color: "#FFFFFF",
                fontSize: "28px",
                cursor: "pointer",
              }}
            >
              ‹
            </button>

            <button
              onClick={siguiente}
              style={{
                position: "fixed",
                right: "30px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "rgba(0,0,0,0.6)",
                border: "1px solid #555",
                borderRadius: "50%",
                width: "50px",
                height: "50px",
                color: "#FFFFFF",
                fontSize: "28px",
                cursor: "pointer",
              }}
            >
              ›
            </button>
          </>
        )}

        <div
          style={{
            position: "fixed",
            bottom: "25px",
            color: "#FFFFFF",
            background: "rgba(0,0,0,0.6)",
            padding: "8px 14px",
            borderRadius: "20px",
          }}
        >
          {indiceActual + 1} / {images.length}
        </div>
      </div>
    </div>
  );
}