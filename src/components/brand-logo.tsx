import React from 'react';

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
    <div className={`relative ${className}`}>
      {/* Versión Negra para Modo Claro */}
      <img 
        src="/img/logonegrosinbg.svg" 
        alt="Market G/S Logo" 
        className="h-full w-full object-contain dark:hidden block"
      />
      {/* Versión Blanca para Modo Oscuro */}
      <img 
        src="/img/logoblancosinbg.svg" 
        alt="Market G/S Logo" 
        className="h-full w-full object-contain hidden dark:block"
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
