"use client";

import { ReactNode } from "react";

type Props = {
  title: string;
  children: ReactNode;
};

export default function SectionCard({
  title,
  children,
}: Props) {
  return (
    <div
      style={{
        background: "#111111",
        borderRadius: "18px",
        padding: "22px",
        marginBottom: "30px",
        border: "1px solid rgba(255,255,255,.08)",
      }}
    >
      <h2
        style={{
          color: "#FF7A00",
          marginTop: 0,
          marginBottom: "20px",
          fontSize: "24px",
        }}
      >
        {title}
      </h2>

      {children}
    </div>
  );
}