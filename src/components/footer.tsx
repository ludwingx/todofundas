import Link from "next/link";
import React from "react";

export function Footer() {
  return (
    <footer className="w-full fixed bottom-0 left-0 z-50 bg-muted">
      <div className="text-center text-xs text-muted-foreground py-2">
        © 2025 <Link className="underline text-primary hover:text-primary/80" target="_blank" href="https://ludwingdev.vercel.app">Ludwing Armijo Saavedra</Link>. Todos los derechos reservados.
      </div>
    </footer>
  );
}
// 