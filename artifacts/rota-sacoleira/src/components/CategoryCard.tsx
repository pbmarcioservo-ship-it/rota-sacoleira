import { Categoria } from "@workspace/api-client-react";
import { Link } from "wouter";
import { 
  Shirt, 
  Gamepad2, 
  Smartphone, 
  Footprints, 
  Briefcase, 
  Store 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const ICON_MAP: Record<string, React.ElementType> = {
  "shirt": Shirt,
  "gamepad": Gamepad2,
  "smartphone": Smartphone,
  "footprints": Footprints,
  "briefcase": Briefcase,
};

export function CategoryCard({ category }: { category: Categoria }) {
  const Icon = ICON_MAP[category.icone] || Store;

  return (
    <Link href={`/categoria/${category.id}`}>
      <Card className="hover-elevate cursor-pointer border-border hover:border-primary/50 transition-colors bg-card h-full">
        <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-sm leading-tight text-foreground">{category.nome}</h3>
            {category.totalLojas !== undefined && (
              <p className="text-xs text-muted-foreground mt-1">
                {category.totalLojas} {category.totalLojas === 1 ? 'loja' : 'lojas'}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
