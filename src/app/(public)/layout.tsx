import Link from "next/link";
import { Package } from "lucide-react";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <Package className="h-5 w-5" />
            Market GS
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/catalogo"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Catálogo
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              Iniciar Sesión
            </Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <div className="container mx-auto px-4">
          <p>© {new Date().getFullYear()} Market GS — Todos los derechos reservados.</p>
          <p className="mt-1 text-xs">Desarrollado por T.S. Ludwing Armijo Saavedra</p>
        </div>
      </footer>
    </div>
  );
}
