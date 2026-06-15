import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useListCategorias, getListCategoriasQueryKey, useListLojas, getListLojasQueryKey } from "@workspace/api-client-react";
import { CategoryCard } from "@/components/CategoryCard";
import { StoreCard } from "@/components/StoreCard";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { BairroFilter, filterByBairroAndRua, type Bairro } from "@/components/BairroFilter";

export default function Dashboard() {
  const [search, setSearch] = useState("");
  const [bairro, setBairro] = useState<Bairro>("todos");
  const [ruaSearch, setRuaSearch] = useState("");

  const { data: categorias, isLoading: loadingCategorias } = useListCategorias({
    query: { queryKey: getListCategoriasQueryKey() }
  });

  const { data: lojasDestaque, isLoading: loadingDestaques } = useListLojas(
    { emDestaque: true },
    { query: { queryKey: getListLojasQueryKey({ emDestaque: true }) } }
  );

  const { data: searchResults, isLoading: loadingSearch } = useListLojas(
    { search: search || undefined },
    { query: { queryKey: getListLojasQueryKey({ search: search || undefined }), enabled: search.length > 2 } }
  );

  const filteredDestaques = filterByBairroAndRua(lojasDestaque ?? [], bairro, ruaSearch);
  const filteredSearch = filterByBairroAndRua(searchResults ?? [], bairro, ruaSearch);

  return (
    <AppLayout title="Início">
      <div className="px-4 lg:px-8 py-6 space-y-6">

        {/* Main search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Buscar loja ou categoria..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="input-search"
            className="pl-11 h-14 bg-card border-border rounded-xl text-base shadow-sm focus-visible:ring-primary focus-visible:border-primary placeholder:text-muted-foreground"
          />
        </div>

        {/* Bairro Filter + rua search */}
        <BairroFilter
          value={bairro}
          onChange={setBairro}
          ruaSearch={ruaSearch}
          onRuaSearch={setRuaSearch}
        />

        {search.length > 2 ? (
          <div className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight text-foreground">Resultados</h2>
            {loadingSearch ? (
              <div className="space-y-3">
                <Skeleton className="h-28 w-full rounded-xl" />
                <Skeleton className="h-28 w-full rounded-xl" />
              </div>
            ) : filteredSearch.length > 0 ? (
              <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
                {filteredSearch.map(loja => (
                  <StoreCard key={loja.id} store={loja} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                Nenhuma loja encontrada para "{search}"
                {bairro !== "todos" || ruaSearch ? " com os filtros aplicados" : ""}.
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Lojas em Destaque */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold tracking-tight text-foreground">Lojas em Destaque</h2>

              {loadingDestaques ? (
                <div className="flex gap-4 overflow-hidden">
                  <Skeleton className="h-36 w-[280px] shrink-0 rounded-xl" />
                  <Skeleton className="h-36 w-[280px] shrink-0 rounded-xl" />
                  <Skeleton className="h-36 w-[280px] shrink-0 rounded-xl" />
                </div>
              ) : filteredDestaques.length > 0 ? (
                <>
                  {/* Mobile: horizontal scroll */}
                  <ScrollArea className="w-full whitespace-nowrap pb-4 -mx-4 lg:hidden px-4">
                    <div className="flex gap-4 w-max">
                      {filteredDestaques.map(loja => (
                        <StoreCard key={loja.id} store={loja} featured />
                      ))}
                    </div>
                    <ScrollBar orientation="horizontal" className="invisible" />
                  </ScrollArea>
                  {/* Desktop: grid */}
                  <div className="hidden lg:grid lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredDestaques.map(loja => (
                      <StoreCard key={loja.id} store={loja} featured />
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm bg-card rounded-xl border border-border">
                  Nenhuma loja em destaque com os filtros aplicados.
                </div>
              )}
            </section>

            {/* Categorias */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold tracking-tight text-foreground">Categorias</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {loadingCategorias ? (
                  [1,2,3,4,5,6,7,8].map(i => (
                    <Skeleton key={i} className="h-28 rounded-xl" />
                  ))
                ) : categorias?.map(categoria => (
                  <CategoryCard key={categoria.id} category={categoria} />
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </AppLayout>
  );
}
