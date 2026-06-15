import { Search } from "lucide-react";

export type Bairro = "todos" | "bras" | "bom-retiro" | "pari" | "bresser";

interface BairroFilterProps {
  value: Bairro;
  onChange: (v: Bairro) => void;
  ruaSearch: string;
  onRuaSearch: (v: string) => void;
}

const OPTIONS: { value: Bairro; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "bras", label: "Brás" },
  { value: "bom-retiro", label: "Bom Retiro" },
  { value: "pari", label: "Pari" },
  { value: "bresser", label: "Bresser" },
];

export function detectBairro(endereco: string): Bairro | "outros" {
  const lower = endereco.toLowerCase();
  if (lower.includes("bom retiro")) return "bom-retiro";
  if (lower.includes("bresser")) return "bresser";
  if (lower.includes("pari")) return "pari";
  if (lower.includes("brás") || lower.includes("bras")) return "bras";
  return "outros";
}

export function filterByBairroAndRua<T extends { endereco: string }>(
  items: T[],
  bairro: Bairro,
  ruaSearch: string,
): T[] {
  return items.filter((item) => {
    const bairroMatch = bairro === "todos" || detectBairro(item.endereco) === bairro;
    const ruaMatch =
      ruaSearch.trim() === "" ||
      item.endereco.toLowerCase().includes(ruaSearch.toLowerCase());
    return bairroMatch && ruaMatch;
  });
}

export function BairroFilter({ value, onChange, ruaSearch, onRuaSearch }: BairroFilterProps) {
  return (
    <div className="space-y-3">
      {/* Region pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide" role="group" aria-label="Filtrar por bairro">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            data-testid={`filter-bairro-${opt.value}`}
            onClick={() => onChange(opt.value)}
            className={[
              "px-4 py-2 rounded-full text-sm font-semibold border transition-colors whitespace-nowrap shrink-0",
              value === opt.value
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground",
            ].join(" ")}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Street/neighborhood text search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={ruaSearch}
          onChange={(e) => onRuaSearch(e.target.value)}
          placeholder="Filtrar por rua ou endereço..."
          data-testid="input-rua-search"
          className="w-full pl-9 pr-4 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary placeholder:text-muted-foreground"
        />
      </div>
    </div>
  );
}
