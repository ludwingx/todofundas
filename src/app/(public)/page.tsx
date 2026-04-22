import Link from "next/link";
import { ArrowRight, Check, ShieldCheck, Zap, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketLogo } from "@/components/brand-logo";
import {
  InstagramIcon,
  WhatsAppIcon,
  TikTokIcon,
  FacebookIcon,
  EmailIcon,
} from "@/components/social-icons";

const WA_NUMBER = "your-number"; // reemplaza con número real

const testimonials = [
  { quote: "No sabía que una funda cambiaba tanto el look de mi teléfono.", name: "Valentina R." },
  { quote: "Siempre me preguntan dónde la compré. Calidad muy distinta al mercado.", name: "Diego M." },
  { quote: "Llegó rápido y era exactamente como en las fotos. La atención es 10/10.", name: "Andrea L." },
];

const objections = [
  {
    q: "¿Y si es mala calidad?",
    a: "No trabajamos con fundas genéricas. Solo modelos probados y curados por nosotros.",
  },
  {
    q: "¿Y si tarda mucho?",
    a: "Entrega rápida y confirmación directa por WhatsApp. Sabes exactamente cuándo llega.",
  },
  {
    q: "¿Y si no es como en fotos?",
    a: "Fotos reales + atención personalizada antes de comprar. Sin sorpresas.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">

      {/* ─── HERO ─── */}
      <section className="relative w-full min-h-[90vh] flex items-center justify-center overflow-hidden bg-white dark:bg-black border-b border-gray-100 dark:border-white/10">
        {/* Blob sutil */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-30 dark:opacity-10">
          <div className="absolute top-[10%] left-[10%] w-[40%] h-[40%] rounded-full bg-gray-200 blur-[120px] dark:bg-[#222]" />
          <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] rounded-full bg-gray-100 blur-[120px] dark:bg-[#1a1a1a]" />
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10 py-20 md:py-28">
          <div className="flex flex-col items-center text-center gap-8 max-w-4xl mx-auto">

            {/* Logo integrado */}
            <div className="flex flex-col items-center gap-0 animate-in slide-in-from-top duration-700">
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-widest uppercase italic leading-[0.85]">
                Market
              </h1>
              <div className="-mt-2 md:-mt-4 animate-in zoom-in duration-700 delay-200">
                <MarketLogo className="h-28 w-28 md:h-52 md:w-52 lg:h-64 lg:w-64 drop-shadow-2xl" />
              </div>
            </div>

            {/* Copy emocional */}
            <div className="space-y-4 animate-in fade-in duration-700 delay-400">
              <p className="text-2xl md:text-4xl font-black leading-tight tracking-tight">
                Tu iPhone habla de ti…
                <br />
                <span className="italic">asegúrate de que diga lo correcto.</span>
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base max-w-[480px] mx-auto leading-relaxed">
                Fundas que no solo protegen —{" "}
                <strong className="text-black dark:text-white">
                  definen tu estilo, tu presencia y cómo te perciben.
                </strong>
              </p>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap justify-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 animate-in fade-in duration-700 delay-500">
              {["✔ Entrega rápida", "✔ Calidad real", "✔ Atención directa"].map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-3 animate-in slide-in-from-bottom duration-700 delay-600">
              <Link href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Hola! Quiero ver los modelos disponibles")}`} target="_blank">
                <Button className="bg-black hover:bg-black/80 text-white hover:text-white dark:bg-white dark:hover:bg-white/80 dark:text-black dark:hover:text-black transition-all h-12 sm:h-14 px-8 sm:px-12 rounded-none font-black text-xs sm:text-sm uppercase tracking-[0.2em] border-none shadow-xl w-56 sm:w-auto">
                  Ver por WhatsApp
                </Button>
              </Link>
              <Link href="/catalogo">
                <Button className="bg-transparent border-2 border-black dark:border-white h-12 sm:h-14 px-8 sm:px-12 rounded-none font-black text-xs sm:text-sm uppercase tracking-[0.2em] hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all w-56 sm:w-auto text-black dark:text-white">
                  Explorar Catálogo
                </Button>
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ─── PROBLEMA ─── */}
      <section className="w-full py-20 bg-white dark:bg-black border-b border-gray-100 dark:border-white/10">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl text-center">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 mb-6">El problema</p>
          <h2 className="text-3xl md:text-5xl font-black leading-tight mb-8">
            La mayoría usa fundas genéricas…
            <br />
            <span className="italic text-gray-400 dark:text-gray-500">que hacen que todos los iPhone se vean iguales.</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10">
            {[
              { label: "Sin estilo", desc: "Una funda del mercado no te diferencia." },
              { label: "Sin identidad", desc: "Tu iPhone no dice nada de quién eres." },
              { label: "Se dañan", desc: "Las baratas duran semanas, no meses." },
            ].map(({ label, desc }) => (
              <div key={label} className="p-6 border border-gray-100 dark:border-white/10 text-left">
                <p className="font-black text-lg uppercase italic mb-2">{label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── AGITACIÓN ─── */}
      <section className="w-full py-20 bg-black text-white border-b border-white/10">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl text-center">
          <p className="text-3xl md:text-5xl font-black leading-tight mb-6">
            Tu iPhone es caro…
            <br />
            <span className="italic text-white/50">pero tu funda hace que parezca común.</span>
          </p>
          <p className="text-white/60 text-sm md:text-base max-w-[400px] mx-auto leading-relaxed">
            Cada vez que lo sacas: no destaca, no representa quién eres, no llama la atención.
          </p>
        </div>
      </section>

      {/* ─── SOLUCIÓN ─── */}
      <section className="w-full py-20 bg-white dark:bg-black border-b border-gray-100 dark:border-white/10">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <div className="text-center mb-12">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 mb-4">La solución</p>
            <h2 className="text-3xl md:text-5xl font-black leading-tight">
              En Market GS no vendemos fundas.
              <br />
              <span className="italic">Curamos estilos.</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { Icon: ShieldCheck, title: "Calidad real", desc: "Solo modelos probados. Nada genérico, nada barato." },
              { Icon: Zap, title: "Duran de verdad", desc: "Materiales seleccionados que aguantan el uso diario real." },
              { Icon: Star, title: "Te hacen destacar", desc: "Diseños que se ven mejor en la vida real que en fotos." },
            ].map(({ Icon, title, desc }) => (
              <div key={title} className="group p-8 border border-gray-100 dark:border-white/10 hover:border-black dark:hover:border-white transition-all duration-300 bg-gray-50 dark:bg-black cursor-default">
                <Icon className="h-8 w-8 mb-4 text-black dark:text-white" />
                <h3 className="font-black text-lg uppercase italic tracking-tight mb-2">{title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BENEFICIOS ─── */}
      <section className="w-full py-20 bg-black text-white border-b border-white/10">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-white/40 mb-6 text-center">Por qué importa</p>
          <div className="space-y-4">
            {[
              "Tu celular se vuelve parte de tu outfit.",
              "Destacas sin decir una palabra.",
              "Protección real, no solo estética.",
              "Opciones que sí valen lo que cuestan.",
            ].map((benefit) => (
              <div key={benefit} className="flex items-start gap-4 py-4 border-b border-white/10 last:border-0">
                <Check className="h-4 w-4 mt-0.5 shrink-0" />
                <p className="font-bold text-base md:text-lg">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRUEBA SOCIAL ─── */}
      <section className="w-full py-20 bg-white dark:bg-black border-b border-gray-100 dark:border-white/10">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 mb-10 text-center">Lo que dicen</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map(({ quote, name }) => (
              <div key={name} className="p-6 border border-gray-100 dark:border-white/10 flex flex-col gap-4">
                <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 italic">"{quote}"</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">— {name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── OBJECIONES ─── */}
      <section className="w-full py-20 bg-white dark:bg-black border-b border-gray-100 dark:border-white/10">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 mb-10 text-center">Preguntas frecuentes</p>
          <div className="space-y-0 divide-y divide-gray-100 dark:divide-white/10">
            {objections.map(({ q, a }) => (
              <div key={q} className="py-6">
                <p className="font-black text-sm uppercase tracking-tight mb-2">{q}</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">→ {a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA FINAL ─── */}
      <section className="w-full py-24 bg-black text-white">
        <div className="container mx-auto px-4 md:px-6 text-center max-w-2xl">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-white/40 mb-6">Es el momento</p>
          <h2 className="text-3xl md:text-5xl font-black leading-tight mb-4">
            Elige cómo quieres
            <br />
            <span className="italic">que se vea tu iPhone.</span>
          </h2>
          <p className="text-white/50 text-sm mb-10 uppercase tracking-widest font-black">
            🔥 Stock limitado — no trabajamos catálogo masivo
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Hola! Quiero ver los modelos disponibles")}`} target="_blank">
              <Button className="bg-white hover:bg-white/80 text-black hover:text-black transition-all h-14 px-12 rounded-none font-black text-sm uppercase tracking-[0.2em] border-none shadow-xl w-64 sm:w-auto">
                Escríbenos por WhatsApp
              </Button>
            </Link>
            <Link href="/catalogo">
              <Button className="bg-transparent border-2 border-white text-white h-14 px-12 rounded-none font-black text-sm uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all w-64 sm:w-auto">
                Ver Catálogo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FOOTER SOCIAL ─── */}
      <section className="w-full py-16 bg-black text-white border-t border-white/10">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="space-y-2 text-center md:text-left">
              <p className="font-black uppercase tracking-[0.3em] text-xs italic">Market GS | Lifestyle</p>
              <p className="text-[10px] text-white/30 max-w-[260px] leading-loose">
                Elevando la experiencia iPhone a través del diseño y la protección de vanguardia.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-6 md:gap-8">
              {[
                { href: "#", label: "Instagram", Icon: InstagramIcon },
                { href: `https://wa.me/${WA_NUMBER}`, label: "WhatsApp", Icon: WhatsAppIcon },
                { href: "#", label: "TikTok", Icon: TikTokIcon },
                { href: "#", label: "Facebook", Icon: FacebookIcon },
                { href: "#", label: "Email", Icon: EmailIcon },
              ].map(({ href, label, Icon }) => (
                <Link key={label} href={href} target="_blank" className="group flex flex-col items-center gap-2">
                  <div className="p-3 rounded-full border border-white/20 text-white group-hover:bg-white group-hover:text-black group-hover:border-white transition-all duration-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 group-hover:text-white transition-colors">{label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
