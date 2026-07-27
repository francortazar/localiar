type Props = {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
};

export default function FormTextarea({
  placeholder,
  value,
  onChange,
  rows = 4,
}: Props) {
  return (
    <textarea
      placeholder={placeholder}
      value={value}
      rows={rows}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "100%",
        padding: "12px",
        borderRadius: "8px",
        border: "1px solid #444",
        background: "#111",
        color: "#FFF",
        fontSize: "14px",
        resize: "vertical",
        boxSizing: "border-box",
      }}
    />
  );
}