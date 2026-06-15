import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Loja,
  PlaceResult,
  useAddFavorito,
  useRemoveFavorito,
  useCheckFavorito,
  useSavePlace,
  getCheckFavoritoQueryKey,
  getListFavoritosQueryKey,
  getListLojasQueryKey,
} from "@workspace/api-client-react";
import { MapPin, MessageCircle, Info, Heart, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";

const DEFAULT_CATEGORIA_ID = 1;

interface InternalCardProps {
  store: Loja;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (selected: boolean) => void;
  disabledSelect?: boolean;
}

function InternalCard({ store, selectable, selected, onSelect, disabledSelect }: InternalCardProps) {
  const queryClient = useQueryClient();
  const { data: favoritoStatus, isLoading: isCheckingFavorito } = useCheckFavorito(store.id, {
    query: { queryKey: getCheckFavoritoQueryKey(store.id) },
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
        },
      });
    } else {
      addFavorito.mutate({ data: { lojaId: store.id } }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getCheckFavoritoQueryKey(store.id) });
          queryClient.invalidateQueries({ queryKey: getListFavoritosQueryKey() });
        },
      });
    }
  };

  return (
    <Card className="relative overflow-hidden w-full bg-card border-border hover:border-primary/20 transition-colors">
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
            <div className="min-w-0">
              <h3 className="font-bold text-base text-foreground truncate">{store.nome}</h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1 truncate">
                <MapPin className="w-3 h-3 shrink-0" />
                <span className="truncate">{store.endereco}</span>
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className={`shrink-0 h-8 w-8 rounded-full ${isFavorite ? "text-destructive hover:text-destructive/80" : "text-muted-foreground hover:text-foreground"}`}
              onClick={toggleFavorite}
              disabled={isPending || isCheckingFavorito}
              data-testid={`button-favorite-${store.id}`}
            >
              {isCheckingFavorito ? (
                <Skeleton className="w-5 h-5 rounded-full" />
              ) : (
                <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
              )}
            </Button>
          </div>
          {(store.regrasAtacado || store.whatsapp) && (
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {store.regrasAtacado && (
                <Badge variant="secondary" className="text-[10px] font-medium px-2 py-0.5 h-5 rounded-sm">
                  <Info className="w-3 h-3 mr-1" />
                  {store.regrasAtacado}
                </Badge>
              )}
              {store.whatsapp && (
                <a
                  href={`https://wa.me/${store.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto"
                >
                  <Button variant="outline" size="sm" className="h-7 text-xs font-semibold px-3 bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800">
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

interface ExternalCardProps {
  place: PlaceResult;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (selected: boolean) => void;
  disabledSelect?: boolean;
  onSavedAsInternal?: (loja: Loja) => void;
}

function ExternalCard({ place, selectable, selected, onSelect, disabledSelect, onSavedAsInternal }: ExternalCardProps) {
  const queryClient = useQueryClient();
  const [saved, setSaved] = useState(false);
  const savePlace = useSavePlace();

  const handleFavorite = () => {
    savePlace.mutate(
      {
        data: {
          placeId: place.placeId,
          nome: place.nome,
          endereco: place.endereco,
          whatsapp: place.whatsapp ?? null,
          latitude: place.latitude ?? null,
          longitude: place.longitude ?? null,
          categoriaId: DEFAULT_CATEGORIA_ID,
          favoritar: true,
        },
      },
      {
        onSuccess: (loja) => {
          setSaved(true);
          queryClient.invalidateQueries({ queryKey: getListLojasQueryKey() });
          queryClient.invalidateQueries({ queryKey: getListFavoritosQueryKey() });
          if (loja) {
            queryClient.invalidateQueries({ queryKey: getCheckFavoritoQueryKey(loja.id) });
            onSavedAsInternal?.(loja);
          }
        },
      }
    );
  };

  return (
    <Card className="relative overflow-hidden w-full bg-card border-dashed border-border hover:border-primary/30 transition-colors">
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
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-foreground truncate">{place.nome}</h3>
                <span className="shrink-0 flex items-center gap-1 text-[10px] font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                  <Globe className="w-2.5 h-2.5" />
                  Maps
                </span>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1 truncate">
                <MapPin className="w-3 h-3 shrink-0" />
                <span className="truncate">{place.endereco}</span>
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className={`shrink-0 h-8 w-8 rounded-full ${saved ? "text-destructive" : "text-muted-foreground hover:text-foreground"}`}
              onClick={handleFavorite}
              disabled={savePlace.isPending || saved}
              data-testid={`button-favorite-place-${place.placeId}`}
              title="Favoritar e salvar no banco"
            >
              <Heart className={`w-5 h-5 ${saved ? "fill-current" : ""}`} />
            </Button>
          </div>
          {place.whatsapp && (
            <div className="flex items-center gap-2 mt-3">
              <a
                href={`https://wa.me/${place.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm" className="h-7 text-xs font-semibold px-3 bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
                  <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
                  WhatsApp
                </Button>
              </a>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export interface HybridResult {
  type: "internal";
  store: Loja;
  placeId?: never;
}

export interface HybridPlaceResult {
  type: "external";
  place: PlaceResult;
  store?: never;
}

export type HybridItem = HybridResult | HybridPlaceResult;

interface HybridSearchResultsProps {
  internalResults: Loja[];
  externalResults: PlaceResult[];
  isLoadingInternal: boolean;
  isLoadingExternal: boolean;
  selectable?: boolean;
  selectedIds?: number[];
  onSelect?: (lojaId: number, selected: boolean) => void;
  isMaxSelected?: boolean;
  onExternalSaved?: (loja: Loja) => void;
}

export function HybridSearchResults({
  internalResults,
  externalResults,
  isLoadingInternal,
  isLoadingExternal,
  selectable,
  selectedIds = [],
  onSelect,
  isMaxSelected,
  onExternalSaved,
}: HybridSearchResultsProps) {
  const hasAny = internalResults.length > 0 || externalResults.length > 0;
  const isLoading = isLoadingInternal || isLoadingExternal;

  if (isLoading && !hasAny) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!hasAny && !isLoading) {
    return (
      <div className="text-center py-12 text-muted-foreground text-sm">
        Nenhuma loja encontrada. Tente um termo diferente.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {internalResults.length > 0 && (
        <>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1 pt-2">
            No banco de dados ({internalResults.length})
          </p>
          <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
            {internalResults.map((store) => (
              <InternalCard
                key={store.id}
                store={store}
                selectable={selectable}
                selected={selectedIds.includes(store.id)}
                onSelect={(sel) => onSelect?.(store.id, sel)}
                disabledSelect={isMaxSelected && !selectedIds.includes(store.id)}
              />
            ))}
          </div>
        </>
      )}

      {isLoadingExternal && internalResults.length > 0 && (
        <div className="space-y-3 pt-2">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      )}

      {externalResults.length > 0 && (
        <>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1 pt-4">
            Google Maps ({externalResults.length})
          </p>
          <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
            {externalResults.map((place) => (
              <ExternalCard
                key={place.placeId}
                place={place}
                selectable={selectable}
                selected={false}
                onSelect={() => {}}
                disabledSelect={isMaxSelected}
                onSavedAsInternal={onExternalSaved}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
