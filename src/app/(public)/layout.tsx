import Link from "next/link";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeSwitch } from "@/components/theme-switch";
import { BrandLogoText } from "@/components/brand-logo";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col bg-white dark:bg-black text-black dark:text-white transition-colors duration-500">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-black/80 backdrop-blur-md border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="transition-transform hover:scale-105 active:scale-95">
            <BrandLogoText />
          </Link>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium tracking-tight">
            <Link href="/catalogo" className="hover:text-gray-500 transition-colors uppercase">Catálogo</Link>
          </div>

          <div className="flex items-center gap-2">
            <ThemeSwitch className="scale-90" />
            <div className="h-4 w-[1px] bg-gray-200 dark:bg-gray-800 mx-2" />
            <Link href="/login">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors">
                <User className="h-5 w-5" />
                <span className="sr-only">Iniciar Sesión</span>
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="w-full py-12 bg-white dark:bg-black border-t border-gray-100 dark:border-gray-900">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <BrandLogoText />
            <p className="text-xs text-gray-500 tracking-widest uppercase text-center md:text-left">
              © 2026 MARKET GS. TODOS LOS DERECHOS RESERVADOS.
            </p>
            <div className="flex gap-6 text-xs font-bold tracking-widest uppercase">
              <Link href="#" className="hover:text-gray-400">Legales</Link>
              <Link href="#" className="hover:text-gray-400">Privacidad</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
