import Link from "next/link";
import { ArrowRight, ShieldCheck, Zap, BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-black text-white relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_100%)] pointer-events-none" />
        <div className="container mx-auto px-4 md:px-6 relative z-10 flex flex-col items-center text-center">
          <Badge variant="outline" className="text-white border-white/20 bg-white/5 backdrop-blur-sm mb-6 px-4 py-1.5 text-sm">
            Market GS App 2026
          </Badge>
          <h1 className="text-5xl font-black tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500 max-w-4xl mx-auto leading-tight md:leading-tight">
            Control Absoluto<br/>Sobre Su Inventario
          </h1>
          <p className="mx-auto max-w-[700px] text-gray-400 text-lg md:text-xl font-light tracking-wide mt-6">
            Plataforma web inteligente impulsada por algoritmos avanzados para la gestión integral de fundas y accesorios. Experimente el futuro del comercio minorista hoy.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/catalogo">
              <Button className="bg-white text-black hover:bg-gray-200 h-14 px-8 rounded-full font-medium text-lg transition-all hover:scale-105 cursor-pointer">
                Explorar Catálogo <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full flex-1 py-16 md:py-24 lg:py-32 bg-background relative border-t flex items-center justify-center">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto grid max-w-6xl items-start gap-12 py-12 lg:grid-cols-3">
            <div className="flex flex-col items-center space-y-4 text-center group">
              <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-primary/5 border border-primary/10 group-hover:bg-primary/10 transition-colors">
                <BrainCircuit className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mt-4">Gestión Inteligente</h3>
              <p className="text-muted-foreground leading-relaxed text-lg">
                Sistema algorítmico que previene pérdidas silenciosas y optimiza el control de mercancía defectuosa en tiempo real.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center group">
              <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-primary/5 border border-primary/10 group-hover:bg-primary/10 transition-colors">
                <ShieldCheck className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mt-4">Precisión Financiera</h3>
              <p className="text-muted-foreground leading-relaxed text-lg">
                Wallet de compensación integrada y cálculo de rentabilidad neta. Cada centavo es rastreado y justificado con precisión.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center group">
              <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-primary/5 border border-primary/10 group-hover:bg-primary/10 transition-colors">
                <Zap className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mt-4">Arquitectura Escalable</h3>
              <p className="text-muted-foreground leading-relaxed text-lg">
                Desarrollado con tecnologías de vanguardia (Next.js 16) preparadas para integración profunda de IA.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

