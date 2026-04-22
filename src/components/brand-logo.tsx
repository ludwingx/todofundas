import React from 'react';
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: number | string;
}

/**
 * Componente de Logo que alterna entre blanco y negro según el tema.
 * Usa los SVGs optimizados sin fondo.
 */
export function MarketLogo({ className = "h-10 w-10" }: LogoProps) {
  return (
    <div className={cn("relative flex items-center justify-center overflow-hidden", className)}>
      {/* Versión Negra para Modo Claro */}
      <img 
        src="/img/logonegrosinbg.svg" 
        alt="Market G/S Logo" 
        className="absolute inset-0 h-full w-full object-contain transition-opacity duration-300 dark:opacity-0 opacity-100"
      />
      {/* Versión Blanca para Modo Oscuro */}
      <img 
        src="/img/logoblancosinbg.svg" 
        alt="Market G/S Logo" 
        className="absolute inset-0 h-full w-full object-contain transition-opacity duration-300 opacity-0 dark:opacity-100"
      />
    </div>
  );
}

/**
 * Versión que permite forzar un color si es necesario (ej: en el Hero)
 */
export function ForcedMarketLogo({ className = "h-10 w-10", variant = "auto" }: LogoProps & { variant?: 'light' | 'dark' | 'auto' }) {
  const src = variant === 'light' 
    ? "/img/logoblancosinbg.svg" 
    : variant === 'dark' 
    ? "/img/logonegrosinbg.svg" 
    : null;

  if (src) {
    return <img src={src} alt="Market G/S Logo" className={`${className} object-contain`} />;
  }

  return <MarketLogo className={className} />;
}

export function BrandLogoText({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="font-black text-xl tracking-tighter uppercase italic text-black dark:text-white">
        Market
      </span>
      <MarketLogo className="h-8 w-8" />
    </div>
  );
}

// Alias para mantener compatibilidad si se usaba BrandLogo
export const BrandLogo = MarketLogo;
