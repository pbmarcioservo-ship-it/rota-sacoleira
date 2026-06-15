import { Loja, useAddFavorito, useRemoveFavorito, useCheckFavorito, getCheckFavoritoQueryKey, getListFavoritosQueryKey } from "@workspace/api-client-react";
import { MapPin, MessageCircle, Info, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";

interface StoreCardProps {
  store: Loja;
  featured?: boolean;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (selected: boolean) => void;
  disabledSelect?: boolean;
}

export function StoreCard({ store, featured, selectable, selected, onSelect, disabledSelect }: StoreCardProps) {
  const queryClient = useQueryClient();
  const { data: favoritoStatus, isLoading: isCheckingFavorito } = useCheckFavorito(store.id, {
    query: { queryKey: getCheckFavoritoQueryKey(store.id) }
  });

  const addFavorito = useAddFavorito();
  const removeFavorito = useRemoveFavorito();

  const isFavorite = favoritoStatus?.isFavorito ?? false;
  const isPending = addFavorito.isPending || removeFavorito.isPending;

  const toggleFavorite = () => {
    if (isFavorite) {
      removeFavorito.mutate({ lojaId: store.id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getCheckFavoritoQueryKey(store.id) });
          queryClient.invalidateQueries({ queryKey: getListFavoritosQueryKey() });
        }
      });
    } else {
      addFavorito.mutate({ data: { lojaId: store.id } }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getCheckFavoritoQueryKey(store.id) });
          queryClient.invalidateQueries({ queryKey: getListFavoritosQueryKey() });
        }
      });
    }
  };

  return (
    <Card className={`relative overflow-hidden ${featured ? 'min-w-[280px]' : 'w-full'} bg-card border-border hover:border-primary/20 transition-colors`}>
      <CardContent className="p-4 flex gap-4">
        {selectable && (
          <div className="flex items-center">
            <Checkbox 
              checked={selected}
              onCheckedChange={(checked) => onSelect?.(!!checked)}
              disabled={disabledSelect && !selected}
              className="w-5 h-5 rounded-md border-primary text-primary"
            />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <div>
              <h3 className="font-bold text-base text-foreground truncate">{store.nome}</h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1 truncate">
                <MapPin className="w-3 h-3 shrink-0" />
                <span className="truncate">{store.endereco}</span>
              </p>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              className={`shrink-0 h-8 w-8 rounded-full ${isFavorite ? 'text-destructive hover:text-destructive/80' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={toggleFavorite}
              disabled={isPending || isCheckingFavorito}
            >
              {isCheckingFavorito ? (
                <Skeleton className="w-5 h-5 rounded-full" />
              ) : (
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              )}
            </Button>
          </div>

          {(store.regrasAtacado || store.whatsapp) && (
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {store.regrasAtacado && (
                <Badge variant="secondary" className="text-[10px] font-medium px-2 py-0.5 h-5 rounded-sm bg-secondary text-secondary-foreground">
                  <Info className="w-3 h-3 mr-1" />
                  {store.regrasAtacado}
                </Badge>
              )}
              {store.whatsapp && (
                <a 
                  href={`https://wa.me/${store.whatsapp.replace(/\D/g,'')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto"
                >
                  <Button variant="outline" size="sm" className="h-7 text-xs font-semibold px-3 bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800 dark:bg-green-950/30 dark:text-green-400 dark:border-green-900/50">
                    <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
                    WhatsApp
                  </Button>
                </a>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
