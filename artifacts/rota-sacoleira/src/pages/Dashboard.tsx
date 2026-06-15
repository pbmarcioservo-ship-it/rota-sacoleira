import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import {
  useListCategorias, getListCategoriasQueryKey,
  useListLojas, getListLojasQueryKey,
  useSearchPlaces, getSearchPlacesQueryKey,
} from "@workspace/api-client-react";
import { CategoryCard } from "@/components/CategoryCard";
import { StoreCard } from "@/components/StoreCard";
import { HybridSearchResults } from "@/components/HybridSearchResults";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { BairroFilter, filterByBairroAndRua, type Bairro } from "@/components/BairroFilter";

export default function Dashboard() {
  const [search, setSearch] = useState("");
  const [bairro, setBairro] = useState<Bairro>("todos");
  const [ruaSearch, setRuaSearch] = useState("");

  const isSearching = search.length > 2;

  const { data: categorias, isLoading: loadingCategorias } = useListCategorias({
    query: { queryKey: getListCategoriasQueryKey() }
  });

  const { data: lojasDestaque, isLoading: loadingDestaques } = useListLojas(
    { emDestaque: true },
    { query: { queryKey: getListLojasQueryKey({ emDestaque: true }) } }
  );

  const { data: internalResults, isLoading: loadingInternal } = useListLojas(
    { search: search || undefined },
    { query: { queryKey: getListLojasQueryKey({ search: search || undefined }), enabled: isSearching } }
  );

  const { data: placesResults, isLoading: loadingPlaces } = useSearchPlaces(
    { q: search },
    { query: { queryKey: getSearchPlacesQueryKey({ q: search }), enabled: isSearching } }
  );

  const filteredDestaques = filterByBairroAndRua(lojasDestaque ?? [], bairro, ruaSearch);

  const filteredInternal = filterByBairroAndRua(internalResults ?? [], bairro, ruaSearch);

  const internalNames = new Set((internalResults ?? []).map(l => l.nome.toLowerCase()));
  const dedupedExternal = (placesResults ?? []).filter(
    p => !internalNames.has(p.nome.toLowerCase())
  );
  const filteredExternal = filterByBairroAndRua(dedupedExternal, bairro, ruaSearch);

  return (
    <AppLayout title="Início">
      <div className="px-4 lg:px-8 py-6 space-y-6">

        {/* Main search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Buscar loja, rua ou bairro em São Paulo..."
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

        {isSearching ? (
          <div className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Resultados para "{search}"
            </h2>
            <HybridSearchResults
              internalResults={filteredInternal}
              externalResults={filteredExternal}
              isLoadingInternal={loadingInternal}
              isLoadingExternal={loadingPlaces}
            />
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
                  <ScrollArea className="w-full whitespace-nowrap pb-4 -mx-4 lg:hidden px-4">
                    <div className="flex gap-4 w-max">
                      {filteredDestaques.map(loja => (
                        <StoreCard key={loja.id} store={loja} featured />
                      ))}
                    </div>
                    <ScrollBar orientation="horizontal" className="invisible" />
                  </ScrollArea>
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
