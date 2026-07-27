"use client";

type Option = {
  id: string;
  nombre: string;
};

type Props = {
  title: string;
  options: Option[];
  selected: string[];
  onChange: (values: string[]) => void;
  allowAll?: boolean;
};

export default function MultiSelect({
  title,
  options,
  selected,
  onChange,
  allowAll = false,
}: Props) {
  function toggle(id: string) {
  if (id === "__ALL__") {
    onChange(selected.includes("__ALL__") ? [] : ["__ALL__"]);
    return;
  }

  let nuevos = selected.filter((item) => item !== "__ALL__");

  if (nuevos.includes(id)) {
    nuevos = nuevos.filter((item) => item !== id);
  } else {
    nuevos = [...nuevos, id];
  }

  onChange(nuevos);
}

  return (
    <div>
      <h3
        style={{
          color: "#FFFFFF",
          fontSize: "15px",
        }}
      >
        {title}
      </h3>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >

        {allowAll && (
  <button
    type="button"
    onClick={() => toggle("__ALL__")}
    style={{
      padding: "8px 12px",
      borderRadius: "20px",
      border: "1px solid #555",
      background: selected.includes("__ALL__")
        ? "#4CAF50"
        : "#111",
      color: "#FFF",
      cursor: "pointer",
      fontWeight: "bold",
    }}
  >
    Todas
  </button>
)}

        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => toggle(option.id)}
            style={{
              padding: "8px 12px",
              borderRadius: "20px",
              border: "1px solid #555",
              background: selected.includes(option.id)
                ? "#FF7A00"
                : "#111",
              color: "#FFF",
              cursor: "pointer",
            }}
          >
            {option.nombre}
          </button>
        ))}
      </div>
    </div>
  );
}