import React from "react";
import { Link, useLocation } from "wouter";
import { Menu, Heart, Home, PackageSearch, ShieldCheck } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export function AppLayout({ children, title }: { children: React.ReactNode; title: string }) {
  const [location] = useLocation();

  return (
    <div className="flex flex-col min-h-[100dvh] w-full max-w-md lg:max-w-7xl mx-auto bg-background shadow-2xl lg:shadow-none relative overflow-hidden">
      <header className="sticky top-0 z-50 flex items-center h-16 px-4 lg:px-8 bg-background/80 backdrop-blur-md border-b border-border">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="shrink-0 mr-3 -ml-2 text-foreground" data-testid="button-menu">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[80vw] max-w-[320px] p-0 flex flex-col bg-background">
            <div className="h-32 bg-primary p-6 flex flex-col justify-end">
              <h2 className="text-2xl font-bold text-primary-foreground tracking-tight flex items-center gap-2">
                <PackageSearch className="w-7 h-7" />
                Rota Sacoleira
              </h2>
            </div>
            <nav className="flex-1 py-4 px-3 flex flex-col gap-1">
              <Link href="/" className="w-full">
                <Button
                  variant={location === "/" ? "secondary" : "ghost"}
                  className="w-full justify-start h-12 text-base font-medium"
                  data-testid="link-inicio"
                >
                  <Home className="w-5 h-5 mr-3 text-primary" />
                  Início
                </Button>
              </Link>
              <Link href="/favoritos" className="w-full">
                <Button
                  variant={location === "/favoritos" ? "secondary" : "ghost"}
                  className="w-full justify-start h-12 text-base font-medium"
                  data-testid="link-favoritos"
                >
                  <Heart className="w-5 h-5 mr-3 text-primary" />
                  Lojas Favoritas
                </Button>
              </Link>
            </nav>
            <div className="px-3 pb-4">
              <Link href="/admin" className="w-full">
                <Button
                  variant={location === "/admin" ? "secondary" : "ghost"}
                  className="w-full justify-start h-10 text-sm font-medium text-muted-foreground"
                  data-testid="link-admin"
                >
                  <ShieldCheck className="w-4 h-4 mr-3 text-muted-foreground" />
                  Área do Administrador
                </Button>
              </Link>
            </div>
            <div className="p-6 border-t border-border">
              <p className="text-sm text-muted-foreground font-medium">Guia Comercial Brás e Bom Retiro</p>
            </div>
          </SheetContent>
        </Sheet>
        <h1 className="text-lg font-bold text-foreground truncate flex-1 tracking-tight">
          {title}
        </h1>
      </header>

      <main className="flex-1 flex flex-col w-full pb-8">
        {children}
      </main>
    </div>
  );
}
