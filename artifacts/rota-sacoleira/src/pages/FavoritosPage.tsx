import { AppLayout } from "@/components/AppLayout";
import { useListFavoritos, getListFavoritosQueryKey } from "@workspace/api-client-react";
import { StoreCard } from "@/components/StoreCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function FavoritosPage() {
  const { data: groups, isLoading } = useListFavoritos({
    query: { queryKey: getListFavoritosQueryKey() }
  });

  const hasFavorites = groups && groups.length > 0 && groups.some(g => g.lojas.length > 0);

  return (
    <AppLayout title="Lojas Favoritas">
      <div className="px-4 py-6 space-y-8">
        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-8 w-40" />
            <div className="space-y-3">
              {[1,2].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
            </div>
          </div>
        ) : hasFavorites ? (
          <div className="space-y-8">
            {groups.filter(g => g.lojas.length > 0).map(group => (
              <div key={group.categoriaId} className="space-y-4">
                <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2 border-b border-border pb-2">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  {group.categoriaNome}
                  <span className="text-xs font-normal text-muted-foreground ml-2">({group.lojas.length})</span>
                </h2>
                <div className="space-y-3">
                  {group.lojas.map(loja => (
                    <StoreCard key={loja.id} store={loja} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 px-6 bg-card rounded-2xl border border-border mt-10">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-6">
              <Heart className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-bold text-xl text-foreground mb-2">Nenhum favorito ainda</h3>
            <p className="text-muted-foreground text-sm mb-8">
              Explore o guia e salve as melhores lojas para acessá-las facilmente.
            </p>
            <Link href="/">
              <Button className="w-full rounded-xl h-12 font-semibold">
                Explorar Lojas
              </Button>
            </Link>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
