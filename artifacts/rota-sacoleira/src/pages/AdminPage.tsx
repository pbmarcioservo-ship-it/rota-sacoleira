import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useListCategorias, getListCategoriasQueryKey, useCreateLoja, getListLojasQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, AlertCircle, Store } from "lucide-react";

const BAIRROS = ["Brás", "Bom Retiro", "Pari", "Bresser", "Outro"];

type FormData = {
  nome: string;
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  categoriaId: string;
  whatsapp: string;
  regrasAtacado: string;
  emDestaque: boolean;
};

const EMPTY: FormData = {
  nome: "",
  rua: "",
  numero: "",
  complemento: "",
  bairro: "Brás",
  categoriaId: "",
  whatsapp: "",
  regrasAtacado: "",
  emDestaque: false,
};

function buildEndereco(f: FormData) {
  const parts = [f.rua.trim()];
  if (f.numero.trim()) parts[0] += `, ${f.numero.trim()}`;
  if (f.complemento.trim()) parts.push(f.complemento.trim());
  parts.push(f.bairro);
  return parts.join(" - ");
}

export default function AdminPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormData>(EMPTY);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const { data: categorias, isLoading: loadingCats } = useListCategorias({
    query: { queryKey: getListCategoriasQueryKey() },
  });

  const createLoja = useCreateLoja({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListLojasQueryKey() });
        setForm(EMPTY);
        setStatus("success");
        setTimeout(() => setStatus("idle"), 4000);
      },
      onError: (err: unknown) => {
        setErrorMsg(err instanceof Error ? err.message : "Erro ao salvar a loja.");
        setStatus("error");
        setTimeout(() => setStatus("idle"), 5000);
      },
    },
  });

  function set(field: keyof FormData, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nome.trim() || !form.rua.trim() || !form.categoriaId) {
      setErrorMsg("Preencha Nome, Rua e Categoria.");
      setStatus("error");
      setTimeout(() => setStatus("idle"), 4000);
      return;
    }
    createLoja.mutate({
      data: {
        nome: form.nome.trim(),
        endereco: buildEndereco(form),
        categoriaId: parseInt(form.categoriaId),
        whatsapp: form.whatsapp.trim() || undefined,
        regrasAtacado: form.regrasAtacado.trim() || undefined,
        emDestaque: form.emDestaque,
      },
    });
  }

  const inputClass =
    "w-full px-3 py-2.5 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary placeholder:text-muted-foreground";
  const labelClass = "block text-sm font-semibold text-foreground mb-1.5";

  return (
    <AppLayout title="Área do Administrador">
      <div className="px-4 lg:px-8 py-6 max-w-2xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Store className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Cadastrar Nova Loja</h2>
            <p className="text-sm text-muted-foreground">A loja aparecerá imediatamente nas buscas após salvar.</p>
          </div>
        </div>

        {status === "success" && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl text-green-800">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium">Loja cadastrada com sucesso!</span>
          </div>
        )}
        {status === "error" && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium">{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 bg-card border border-border rounded-2xl p-6">

          {/* Nome */}
          <div>
            <label className={labelClass}>
              Nome da Loja <span className="text-primary">*</span>
            </label>
            <Input
              value={form.nome}
              onChange={(e) => set("nome", e.target.value)}
              placeholder="Ex: Confecções São Paulo Atacado"
              data-testid="input-admin-nome"
              className={inputClass}
            />
          </div>

          {/* Endereço */}
          <div>
            <label className={labelClass}>
              Endereço <span className="text-primary">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="col-span-2">
                <input
                  value={form.rua}
                  onChange={(e) => set("rua", e.target.value)}
                  placeholder="Rua / Avenida"
                  data-testid="input-admin-rua"
                  className={inputClass}
                />
              </div>
              <input
                value={form.numero}
                onChange={(e) => set("numero", e.target.value)}
                placeholder="Número"
                data-testid="input-admin-numero"
                className={inputClass}
              />
            </div>
            <input
              value={form.complemento}
              onChange={(e) => set("complemento", e.target.value)}
              placeholder="Complemento (Box, Sala, Loja...)"
              data-testid="input-admin-complemento"
              className={`${inputClass} mb-3`}
            />
            <div className="text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg">
              Endereço gerado: <span className="font-mono font-medium text-foreground">{buildEndereco(form) || "—"}</span>
            </div>
          </div>

          {/* Bairro */}
          <div>
            <label className={labelClass}>
              Bairro / Região <span className="text-primary">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {BAIRROS.map((b) => (
                <button
                  key={b}
                  type="button"
                  data-testid={`select-bairro-${b.toLowerCase().replace(" ", "-")}`}
                  onClick={() => set("bairro", b)}
                  className={[
                    "px-4 py-2 rounded-full text-sm font-semibold border transition-colors",
                    form.bairro === b
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-muted-foreground border-border hover:border-primary/50",
                  ].join(" ")}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Categoria */}
          <div>
            <label className={labelClass}>
              Categoria <span className="text-primary">*</span>
            </label>
            {loadingCats ? (
              <Skeleton className="h-10 w-full rounded-lg" />
            ) : (
              <select
                value={form.categoriaId}
                onChange={(e) => set("categoriaId", e.target.value)}
                data-testid="select-admin-categoria"
                className={inputClass}
              >
                <option value="">Selecione uma categoria...</option>
                {categorias?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* WhatsApp */}
          <div>
            <label className={labelClass}>WhatsApp</label>
            <Input
              value={form.whatsapp}
              onChange={(e) => set("whatsapp", e.target.value)}
              placeholder="5511999990000 (com DDI e DDD)"
              data-testid="input-admin-whatsapp"
              className={inputClass}
            />
          </div>

          {/* Regras de Atacado */}
          <div>
            <label className={labelClass}>Regras de Atacado (Mínimo de Peças)</label>
            <textarea
              value={form.regrasAtacado}
              onChange={(e) => set("regrasAtacado", e.target.value)}
              placeholder="Ex: Grade mínima 6 peças por cor, aceita PIX e dinheiro"
              data-testid="input-admin-regras"
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* Destaque */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={form.emDestaque}
                  onChange={(e) => set("emDestaque", e.target.checked)}
                  data-testid="checkbox-admin-destaque"
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted rounded-full peer-checked:bg-primary transition-colors" />
                <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
              </div>
              <div>
                <span className="text-sm font-semibold text-foreground">Loja em Destaque</span>
                <p className="text-xs text-muted-foreground">Aparece no carrossel da tela inicial</p>
              </div>
            </label>
          </div>

          <Button
            type="submit"
            disabled={createLoja.isPending}
            data-testid="button-admin-salvar"
            className="w-full h-12 text-base font-bold rounded-xl"
          >
            {createLoja.isPending ? "Salvando..." : "Salvar Loja"}
          </Button>
        </form>
      </div>
    </AppLayout>
  );
}
