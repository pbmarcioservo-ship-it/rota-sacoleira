export type Bairro = "todos" | "bras" | "bom-retiro";

interface BairroFilterProps {
  value: Bairro;
  onChange: (v: Bairro) => void;
}

const OPTIONS: { value: Bairro; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "bras", label: "Brás" },
  { value: "bom-retiro", label: "Bom Retiro" },
];

export function detectBairro(endereco: string): "bras" | "bom-retiro" | "outros" {
  const lower = endereco.toLowerCase();
  if (lower.includes("bom retiro")) return "bom-retiro";
  if (lower.includes("brás") || lower.includes("bras")) return "bras";
  return "outros";
}

export function BairroFilter({ value, onChange }: BairroFilterProps) {
  return (
    <div className="flex gap-2" role="group" aria-label="Filtrar por bairro">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          data-testid={`filter-bairro-${opt.value}`}
          onClick={() => onChange(opt.value)}
          className={[
            "px-4 py-2 rounded-full text-sm font-semibold border transition-colors whitespace-nowrap",
            value === opt.value
              ? "bg-primary text-primary-foreground border-primary shadow-sm"
              : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground",
          ].join(" ")}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
