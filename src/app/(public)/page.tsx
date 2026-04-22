import Link from "next/link";
import { Package, ArrowRight, ShieldCheck, Zap, Smartphone, BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-black text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_100%)] pointer-events-none" />
        <div className="container px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <Badge variant="outline" className="text-white border-white/20 bg-white/5 backdrop-blur-sm mb-4 px-3 py-1">
                Market GS App 2026
              </Badge>
              <h1 className="text-4xl font-black tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                Control Absoluto<br/>Sobre Su Inventario
              </h1>
              <p className="mx-auto max-w-[800px] text-gray-400 md:text-xl font-light tracking-wide mt-4">
                Plataforma web inteligente impulsada por algoritmos avanzados para la gestión integral de fundas y accesorios. Experimente el futuro del comercio minorista hoy.
              </p>
            </div>
            <div className="space-x-4 mt-8 flex items-center">
              <Link href="/catalogo">
                <Button className="bg-white text-black hover:bg-gray-200 h-12 px-8 rounded-full font-medium transition-all hover:scale-105">
                  Explorar Catálogo <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-16 md:py-24 lg:py-32 bg-background relative border-t">
        <div className="container px-4 md:px-6">
          <div className="mx-auto grid max-w-5xl items-center gap-8 py-12 lg:grid-cols-3 lg:gap-12">
            <div className="flex flex-col items-center space-y-4 text-center group">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/5 border border-primary/10 group-hover:bg-primary/10 transition-colors">
                <BrainCircuit className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Gestión Inteligente</h3>
              <p className="text-muted-foreground leading-relaxed">
                Sistema algorítmico que previene pérdidas silenciosas y optimiza el control de mercancía defectuosa en tiempo real.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center group">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/5 border border-primary/10 group-hover:bg-primary/10 transition-colors">
                <ShieldCheck className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Precisión Financiera</h3>
              <p className="text-muted-foreground leading-relaxed">
                Wallet de compensación integrada y cálculo de rentabilidad neta. Cada centavo es rastreado y justificado con precisión.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center group">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/5 border border-primary/10 group-hover:bg-primary/10 transition-colors">
                <Zap className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Arquitectura Escalable</h3>
              <p className="text-muted-foreground leading-relaxed">
                Desarrollado con tecnologías de vanguardia (Next.js 16) preparadas para integración profunda de IA.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

