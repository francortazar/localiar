"use client";

import Link from "next/link";

type Props = {
  icon: string;
  title: string;
  description: string;
  href: string;
};

export default function AdminCard({
  icon,
  title,
  description,
  href,
}: Props) {
  return (
    <Link
      href={href}
      style={{
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <div
        style={{
          background: "#111111",
          borderRadius: "18px",
          padding: "22px",
          border: "1px solid rgba(255,255,255,.08)",
          transition: ".2s",
          cursor: "pointer",
        }}
      >
        <div
          style={{
            fontSize: "34px",
            marginBottom: "15px",
          }}
        >
          {icon}
        </div>

        <h2
          style={{
            margin: 0,
            color: "#FF7A00",
            fontSize: "22px",
          }}
        >
          {title}
        </h2>

        <p
          style={{
            color: "#999",
            marginTop: "10px",
            lineHeight: 1.5,
          }}
        >
          {description}
        </p>
      </div>
    </Link>
  );
}