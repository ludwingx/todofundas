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

const WA_NUMBER = "59170000000"; 
const WA_LINK = `https://wa.me/${WA_NUMBER}`;

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
      <section className="relative w-full min-h-[85vh] flex items-center justify-center overflow-hidden bg-white dark:bg-black border-b border-gray-100 dark:border-white/10">
        {/* Blob sutil */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-30 dark:opacity-10">
          <div className="absolute top-[10%] left-[10%] w-[40%] h-[40%] rounded-full bg-gray-200 blur-[120px] dark:bg-[#222]" />
          <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] rounded-full bg-gray-100 blur-[120px] dark:bg-[#1a1a1a]" />
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10 py-20 md:py-28">
          <div className="flex flex-col items-center text-center gap-8 max-w-4xl mx-auto">

            {/* Logo integrado */}
            <div className="flex flex-col items-center gap-0 animate-in slide-in-from-top duration-700">
              <h1 className="text-8xl md:text-[12rem] lg:text-[16rem] font-black tracking-tighter uppercase italic leading-[0.7]">
                Market
              </h1>
              <div className="-mt-6 md:-mt-12 animate-in zoom-in duration-700 delay-200">
                <MarketLogo className="h-32 w-32 md:h-64 md:w-64 lg:h-80 lg:w-80 drop-shadow-2xl" />
              </div>
            </div>

            {/* Copy emocional */}
            <div className="space-y-2 animate-in fade-in duration-700 delay-400">
              <p className="text-3xl md:text-6xl font-black leading-none tracking-tighter uppercase italic">
                Tu iPhone habla de vos…
              </p>
              <p className="text-xl md:text-3xl font-black opacity-30 italic">
                asegurate de que diga lo correcto.
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
              <Link href={WA_LINK} target="_blank">
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

      {/* ─── CONTRASTE (PROBLEMA + AGITACIÓN) ─── */}
      <section className="w-full py-20 bg-black text-white border-b border-white/10">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl text-center">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-white/40 mb-6 italic">La realidad</p>
          <h2 className="text-3xl md:text-5xl font-black leading-tight mb-8">
            Tu iPhone es una pieza de diseño...
            <br />
            <span className="italic text-white/50">pero tu funda lo hace ver común.</span>
          </h2>
          <p className="text-white/40 text-[10px] md:text-xs max-w-[360px] mx-auto leading-relaxed mb-12 uppercase tracking-[0.2em] font-bold">
            No dejes que tu equipo pase desapercibido con una funda genérica.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { label: "Sin estilo", desc: "No te diferencia del resto." },
              { label: "Sin identidad", desc: "No dice nada de quién eres." },
              { label: "Descartables", desc: "Duran semanas, no meses." },
            ].map(({ label, desc }) => (
              <div key={label} className="text-center sm:text-left space-y-2">
                <p className="font-black text-lg uppercase italic text-white">{label}</p>
                <p className="text-[10px] text-white/40 uppercase tracking-widest">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SOLUCIÓN + BENEFICIOS ─── */}
      <section className="w-full py-20 bg-white dark:bg-black border-b border-gray-100 dark:border-white/10">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <div className="text-center mb-16">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 mb-4 italic">Nuestra propuesta</p>
            <h2 className="text-3xl md:text-5xl font-black leading-tight">
              Curamos piezas exclusivas,
              <br />
              <span className="italic">no vendemos masa.</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { Icon: ShieldCheck, title: "Calidad Real", desc: "Modelos probados y seleccionados." },
              { Icon: Zap, title: "Diseño Premium", desc: "Tu celular se vuelve parte de tu outfit." },
              { Icon: Star, title: "Exclusividad", desc: "Destaca con piezas que no verás en otro lugar." },
            ].map(({ Icon, title, desc }) => (
              <div key={title} className="p-8 border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-black">
                <Icon className="h-6 w-6 mb-4 text-black dark:text-white" />
                <h3 className="font-black text-lg uppercase italic tracking-tight mb-2">{title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SOCIAL PROOF + FAQ (Compacto) ─── */}
      <section className="w-full py-20 bg-white dark:bg-black border-b border-gray-100 dark:border-white/10">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            {/* Testimonials */}
            <div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 mb-10">Testimonios</p>
              <div className="space-y-8">
                {testimonials.slice(0, 2).map(({ quote, name }) => (
                  <div key={name} className="border-l-2 border-black dark:border-white pl-6">
                    <p className="text-base italic mb-2">"{quote}"</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">— {name}</p>
                  </div>
                ))}
              </div>
            </div>
            {/* FAQ */}
            <div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 mb-10">FAQ</p>
              <div className="space-y-6">
                {objections.slice(0, 2).map(({ q, a }) => (
                  <div key={q}>
                    <p className="font-black text-xs uppercase mb-1">{q}</p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed">{a}</p>
                  </div>
                ))}
              </div>
            </div>
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
            <Link href={WA_LINK} target="_blank">
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
                { href: WA_LINK, label: "WhatsApp", Icon: WhatsAppIcon },
                { href: "https://www.tiktok.com/@thobias_gabriel_zabala", label: "TikTok (P)", Icon: TikTokIcon },
                { href: "https://www.tiktok.com/@market_gs", label: "TikTok (S)", Icon: TikTokIcon },
                { href: "mailto:Marketgs51@gmail.com", label: "Email", Icon: EmailIcon },
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
