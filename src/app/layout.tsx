import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FundaMania - Gestión de Stock",
  description: "Sistema de gestión de inventario para fundas y protectores de celular",
  keywords: ["fundas", "protectores", "celular", "inventario", "stock", "ventas"],
  authors: [{ name: "Ludwing Dev" }]
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Toaster position="bottom-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
