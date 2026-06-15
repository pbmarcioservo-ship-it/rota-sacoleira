import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useParams } from "wouter";
import { useListLojas, getListLojasQueryKey, useListCategorias, getListCategoriasQueryKey } from "@workspace/api-client-react";
import { StoreCard } from "@/components/StoreCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Map, Navigation } from "lucide-react";
import { RoteiroSheet } from "@/components/RoteiroSheet";

export default function CategoriaPage() {
  const { id } = useParams();
  const categoryId = id ? parseInt(id) : null;
  const [selectedStores, setSelectedStores] = useState<number[]>([]);
  const [showRoteiro, setShowRoteiro] = useState(false);

  const { data: categorias } = useListCategorias({
    query: { queryKey: getListCategoriasQueryKey(), enabled: !!categoryId }
  });
  
  const category = categorias?.find(c => c.id === categoryId);

  const { data: lojas, isLoading } = useListLojas(
    { categoriaId: categoryId || undefined },
    { query: { queryKey: getListLojasQueryKey({ categoriaId: categoryId || undefined }), enabled: !!categoryId } }
  );

  const toggleSelect = (lojaId: number, isSelected: boolean) => {
    if (isSelected) {
      if (selectedStores.length < 10) {
        setSelectedStores([...selectedStores, lojaId]);
      }
    } else {
      setSelectedStores(selectedStores.filter(id => id !== lojaId));
    }
  };

  const isMaxSelected = selectedStores.length >= 10;

  return (
    <AppLayout title={category?.nome || "Lojas"}>
      <div className="flex-1 flex flex-col relative pb-24">
        <div className="px-4 py-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground font-medium">
              Selecione até 10 lojas para traçar uma rota
            </p>
            <span className="text-sm font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">
              {selectedStores.length}/10
            </span>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1,2,3,4].map(i => (
                <Skeleton key={i} className="h-32 w-full rounded-xl" />
              ))}
            </div>
          ) : lojas && lojas.length > 0 ? (
            <div className="space-y-3">
              {lojas.map(loja => (
                <StoreCard 
                  key={loja.id} 
                  store={loja} 
                  selectable 
                  selected={selectedStores.includes(loja.id)}
                  onSelect={(sel) => toggleSelect(loja.id, sel)}
                  disabledSelect={isMaxSelected}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-4 bg-card rounded-xl border border-border">
              <Map className="w-12 h-12 text-muted mx-auto mb-4" />
              <h3 className="font-bold text-lg text-foreground mb-1">Nenhuma loja</h3>
              <p className="text-muted-foreground text-sm">Ainda não temos lojas cadastradas nesta categoria.</p>
            </div>
          )}
        </div>

        {selectedStores.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-background/90 backdrop-blur-md border-t border-border shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] z-40">
            <Button 
              className="w-full h-14 text-base font-bold rounded-xl shadow-lg hover-elevate"
              onClick={() => setShowRoteiro(true)}
            >
              <Navigation className="w-5 h-5 mr-2" />
              Traçar Trajeto ({selectedStores.length})
            </Button>
          </div>
        )}

        <RoteiroSheet 
          open={showRoteiro} 
          onOpenChange={setShowRoteiro} 
          selectedStoreIds={selectedStores}
        />
      </div>
    </AppLayout>
  );
}
