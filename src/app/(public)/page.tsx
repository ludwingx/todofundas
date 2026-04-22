import Link from "next/link";
import { 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Smartphone,
  Sparkles,
  Camera
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketLogo } from "@/components/brand-logo";
import { Badge } from "@/components/ui/badge";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section - Enfoque Boutique iPhone */}
      <section className="relative w-full min-h-[75vh] flex items-center justify-center overflow-hidden border-b border-gray-100 dark:border-gray-900 py-16 md:py-24">
        {/* Subtle Background blobs */}
        <div className="absolute inset-0 z-0 opacity-20 dark:opacity-10 overflow-hidden pointer-events-none">
          <div className="absolute top-[10%] left-[10%] w-[40%] h-[40%] rounded-full bg-gray-200 blur-[100px] dark:bg-gray-800" />
          <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] rounded-full bg-gray-100 blur-[100px] dark:bg-gray-700" />
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center text-center">
            
            <div className="flex flex-col items-center space-y-4 max-w-4xl">
              {/* Título y Logo Ultra-Integrados */}
              <div className="flex flex-col items-center justify-center gap-0">
                <h1 className="text-7xl md:text-8xl lg:text-[10rem] font-black tracking-widest uppercase italic animate-in slide-in-from-top duration-1000 leading-[0.8]">
                  Market
                </h1>
                <div className="animate-in zoom-in duration-1000 delay-300 -mt-2 md:-mt-4">
                  <MarketLogo className="h-32 w-32 md:h-56 md:w-56 lg:h-72 lg:w-72 drop-shadow-2xl" />
                </div>
              </div>

              <div className="space-y-4 pt-4 animate-in fade-in duration-1000 delay-500">
                <h2 className="text-xl md:text-2xl font-bold uppercase tracking-[0.3em] text-primary italic">Especialistas en iPhone</h2>
                <p className="mx-auto max-w-[500px] text-gray-500 dark:text-gray-400 text-base md:text-lg font-medium tracking-tight leading-relaxed">
                  Curaduría exclusiva de fundas premium diseñadas <br className="hidden sm:block" />
                  para elevar y proteger tu iPhone al máximo nivel.
                </p>
              </div>
            </div>

            <div className="flex items-center pt-12 animate-in slide-in-from-bottom duration-1000 delay-700">
              <Link href="/catalogo">
                <Button className="bg-black dark:bg-white text-white dark:text-black hover:invert transition-all border-none h-16 px-16 rounded-none font-black text-xl uppercase tracking-[0.2em] shadow-2xl">
                  Explorar Colección
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Boutique Experience - Simplificado */}
      <section className="w-full py-24 bg-white dark:bg-black">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Fila 1: Fundas */}
            <div className="group relative aspect-[4/5] bg-gray-50 dark:bg-gray-950 p-10 flex flex-col justify-end overflow-hidden border border-transparent hover:border-black dark:hover:border-white transition-all duration-700">
              <div className="absolute top-10 left-10 text-gray-200 dark:text-gray-800">
                <Smartphone className="h-24 w-24" />
              </div>
              <div className="relative z-10 space-y-2">
                <h3 className="text-3xl font-black uppercase italic tracking-tighter">Estilo Puro</h3>
                <p className="text-gray-500 text-sm leading-relaxed max-w-[200px]">Fundas con acabados de alta gama y texturas únicas.</p>
                <div className="pt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                  Ver Fundas <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            </div>

            {/* Fila 2: Proteccion */}
            <div className="group relative aspect-[4/5] bg-gray-50 dark:bg-gray-950 p-10 flex flex-col justify-end overflow-hidden border border-transparent hover:border-black dark:hover:border-white transition-all duration-700">
              <div className="absolute top-10 left-10 text-gray-200 dark:text-gray-800">
                <ShieldCheck className="h-24 w-24" />
              </div>
              <div className="relative z-10 space-y-2">
                <h3 className="text-3xl font-black uppercase italic tracking-tighter">Protección</h3>
                <p className="text-gray-500 text-sm leading-relaxed max-w-[200px]">Resistencia certificada contra impactos y rayaduras.</p>
                <div className="pt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                  Ver Micas <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            </div>

            {/* Fila 3: Lanzamientos */}
            <div className="group relative aspect-[4/5] bg-black text-white p-10 flex flex-col justify-end overflow-hidden border border-transparent hover:border-white transition-all duration-700">
              <div className="absolute top-10 left-10 text-gray-800">
                <Sparkles className="h-24 w-24" />
              </div>
              <div className="relative z-10 space-y-2">
                <Badge variant="outline" className="text-white border-white/20 mb-2">Próximamente</Badge>
                <h3 className="text-3xl font-black uppercase italic tracking-tighter">Colección Elite</h3>
                <p className="text-gray-400 text-sm leading-relaxed max-w-[200px]">Accesorios seleccionados y ediciones limitadas.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Minimal Footer Info */}
      <section className="w-full py-16 border-t border-gray-100 dark:border-gray-900 bg-white dark:bg-black">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
            <div className="space-y-2">
              <h4 className="font-black uppercase tracking-[0.2em] text-sm italic">Market GS | Estilo de Vida</h4>
              <p className="text-xs text-gray-500 max-w-[300px]">
                Enfocados en la estética y protección de dispositivos Apple. Envíos nacionales certificados.
              </p>
            </div>
            <div className="flex gap-8">
              <div className="text-center">
                <Camera className="h-5 w-5 mx-auto mb-2 text-gray-300" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Instagram</span>
              </div>
              <div className="text-center">
                <Zap className="h-5 w-5 mx-auto mb-2 text-gray-300" />
                <span className="text-[10px] font-bold uppercase tracking-widest">WhatsApp</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
