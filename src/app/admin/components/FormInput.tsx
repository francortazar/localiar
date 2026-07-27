type Props = {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
};

export default function FormInput({
  placeholder,
  value,
  onChange,
  type = "text",
}: Props) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "100%",
        padding: "10px 12px",
        borderRadius: "8px",
        border: "1px solid #444",
        background: "#111",
        color: "#FFF",
        outline: "none",
        fontSize: "14px",
        boxSizing: "border-box",
      }}
    />
  );
}