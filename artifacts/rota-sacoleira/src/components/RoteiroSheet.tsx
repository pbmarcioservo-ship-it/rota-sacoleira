import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Map, Clock, Navigation, MapPin } from "lucide-react";
import { useCalcularRoteiro } from "@workspace/api-client-react";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

interface RoteiroSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedStoreIds: number[];
}

export function RoteiroSheet({ open, onOpenChange, selectedStoreIds }: RoteiroSheetProps) {
  const calcularRoteiro = useCalcularRoteiro();
  const [hasCalculated, setHasCalculated] = useState(false);

  useEffect(() => {
    if (open && selectedStoreIds.length > 0) {
      calcularRoteiro.mutate({ data: { lojaIds: selectedStoreIds } });
      setHasCalculated(true);
    }
  }, [open]);

  const roteiro = calcularRoteiro.data;
  const isLoading = calcularRoteiro.isPending;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl px-0 pb-0 flex flex-col gap-0 border-t-0 bg-background">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border text-left">
          <SheetTitle className="flex items-center gap-2 text-xl">
            <Navigation className="w-5 h-5 text-primary" />
            Trajeto Otimizado
          </SheetTitle>
          <SheetDescription>
            Rota sugerida para suas {selectedStoreIds.length} paradas.
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="p-6 space-y-6">
            <div className="flex gap-4 mb-6">
              <Skeleton className="h-20 flex-1 rounded-xl" />
              <Skeleton className="h-20 flex-1 rounded-xl" />
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : roteiro ? (
          <>
            <div className="px-6 py-4 flex gap-4 bg-muted/30">
              <div className="flex-1 bg-card rounded-xl p-4 border border-border flex flex-col items-center justify-center text-center">
                <Map className="w-5 h-5 text-primary mb-2" />
                <span className="text-xl font-bold text-foreground">{roteiro.distanciaTotal.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">km</span></span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1">Distância</span>
              </div>
              <div className="flex-1 bg-card rounded-xl p-4 border border-border flex flex-col items-center justify-center text-center">
                <Clock className="w-5 h-5 text-primary mb-2" />
                <span className="text-xl font-bold text-foreground">{roteiro.tempoTotal} <span className="text-sm font-normal text-muted-foreground">min</span></span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1">Tempo Est.</span>
              </div>
            </div>

            <ScrollArea className="flex-1 px-6">
              <div className="py-4 relative">
                <div className="absolute left-4 top-8 bottom-8 w-0.5 bg-border z-0" />
                
                {roteiro.paradas.map((parada, index) => (
                  <div key={parada.loja.id} className="relative z-10 flex gap-4 mb-8 last:mb-4">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center text-sm shrink-0 shadow-sm border-2 border-background">
                      {parada.ordem}
                    </div>
                    <div className="flex-1 pt-1">
                      <h4 className="font-bold text-base text-foreground leading-none">{parada.loja.nome}</h4>
                      <p className="text-sm text-muted-foreground mt-1 flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>{parada.loja.endereco}</span>
                      </p>
                      
                      {parada.distanciaAnterior != null && parada.tempoEstimado != null && index > 0 && (
                        <div className="mt-2 inline-flex items-center gap-2 text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-md">
                          <span>+{parada.distanciaAnterior.toFixed(1)}km</span>
                          <span className="w-1 h-1 rounded-full bg-primary/40" />
                          <span>+{parada.tempoEstimado} min</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="p-4 border-t border-border bg-background sticky bottom-0">
              <Button 
                className="w-full h-14 text-base font-bold rounded-xl shadow-lg hover-elevate"
                onClick={() => window.open(roteiro.mapUrl, '_blank')}
              >
                <Map className="w-5 h-5 mr-2" />
                Abrir no Google Maps
              </Button>
            </div>
          </>
        ) : (
          <div className="p-6 text-center text-muted-foreground">
            Erro ao calcular rota.
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
