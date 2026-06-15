import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useListCategorias, getListCategoriasQueryKey, useListLojas, getListLojasQueryKey } from "@workspace/api-client-react";
import { CategoryCard } from "@/components/CategoryCard";
import { StoreCard } from "@/components/StoreCard";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export default function Dashboard() {
  const [search, setSearch] = useState("");
  
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

  return (
    <AppLayout title="Início">
      <div className="px-4 py-6 space-y-8">
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input 
            placeholder="Buscar loja ou categoria..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 h-14 bg-card border-border rounded-xl text-base shadow-sm focus-visible:ring-primary focus-visible:border-primary placeholder:text-muted-foreground"
          />
        </div>

        {search.length > 2 ? (
          <div className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight text-foreground">Resultados</h2>
            {loadingSearch ? (
              <div className="space-y-3">
                <Skeleton className="h-28 w-full rounded-xl" />
                <Skeleton className="h-28 w-full rounded-xl" />
              </div>
            ) : searchResults && searchResults.length > 0 ? (
              <div className="space-y-3">
                {searchResults.map(loja => (
                  <StoreCard key={loja.id} store={loja} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                Nenhuma loja encontrada para "{search}".
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Lojas em Destaque */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold tracking-tight text-foreground">Lojas em Destaque</h2>
              </div>
              
              <ScrollArea className="w-full whitespace-nowrap pb-4 -mx-4 px-4">
                <div className="flex gap-4 w-max">
                  {loadingDestaques ? (
                    <>
                      <Skeleton className="h-32 w-[280px] rounded-xl" />
                      <Skeleton className="h-32 w-[280px] rounded-xl" />
                    </>
                  ) : lojasDestaque?.map(loja => (
                    <StoreCard key={loja.id} store={loja} featured />
                  ))}
                </div>
                <ScrollBar orientation="horizontal" className="invisible" />
              </ScrollArea>
            </section>

            {/* Categorias */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold tracking-tight text-foreground">Categorias</h2>
              
              <div className="grid grid-cols-2 gap-4">
                {loadingCategorias ? (
                  <>
                    {[1,2,3,4,5,6].map(i => (
                      <Skeleton key={i} className="h-28 rounded-xl" />
                    ))}
                  </>
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
