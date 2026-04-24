"use client";

import * as React from "react";
import {
  BarChart3,
  ShoppingCart,
  Package,
  ShoppingBag,
  History,
  Users,
  Settings,
  AlertTriangle,
  TrendingUp,
  FileText,
  Smartphone,
  Palette,
  BookOpen,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { CompanyHeader } from "@/components/company-header";
import { MarketLogo } from "@/components/brand-logo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

const CompanyLogo = ({ className }: { className?: string }) => (
  <MarketLogo className={className} />
);

// Navigation data for marketgs system
const data = {
  user: {
    name: "Usuario",
    email: "usuario@marketgs.com",
    avatar: "/avatars/default.jpg",
  },
  company: {
    name: "Market G/S",
    logo: CompanyLogo,
    plan: "By: Ludwing",
  },
  navMain: [
    {
      title: "Ver Tienda Pública",
      url: "/",
      icon: Smartphone,
    },
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: BarChart3,
      isActive: true,
    },
    {
      title: "Ventas",
      icon: ShoppingCart,
      url: "/ventas",
      items: [
        {
          title: "Nueva Venta",
          url: "/ventas/nueva",
        },
        {
          title: "Historial",
          url: "/ventas",
        },
      ],
    },
    {
      title: "Compras",
      icon: ShoppingBag,
      url: "/compras",
      items: [
        {
          title: "Nueva Compra",
          url: "/compras/nueva",
        },
        {
          title: "Historial",
          url: "/compras",
        },
      ],
    },
    {
      title: "Inventario",
      icon: Package,
      url: "/inventario",
      items: [
        {
          title: "Productos",
          url: "/inventario/productos",
        },
        {
          title: "Catálogo Público",
          url: "/inventario/catalogo",
        },
        {
          title: "Movimientos",
          url: "/inventario/movements",
        },
      ],
    },
    {
      title: "Configuración",
      icon: Settings,
      url: "/configuracion",
      items: [
        {
          title: "Marcas",
          url: "/configuracion/marcas",
        },
        {
          title: "Modelos de Teléfono",
          url: "/configuracion/modelos",
        },
        {
          title: "Colores",
          url: "/configuracion/colores",
        },
        {
          title: "Tipos de Productos",
          url: "/configuracion/tipos",
        },
        {
          title: "Tipos de Materiales",
          url: "/configuracion/materiales",
        },
        {
          title: "Usuarios",
          url: "/configuracion/usuarios",
        },
        {
          title: "Proveedores",
          url: "/configuracion/proveedores",
        },
        {
          title: "Ajustes",
          url: "/configuracion/ajustes",
        },
      ],
    },
    {
      title: "Wallet",
      icon: History,
      url: "/wallet",
    },
    {
      title: "Reportes",
      icon: FileText,
      url: "/reportes",
    },
    {
      title: "Guía de Uso",
      icon: BookOpen,
      url: "/guia",
    },
  ],
};

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user?: { name: string; email: string; avatar: string; role?: string };
}) {
  const isAdmin = user?.role === "admin" || user?.role === "admin2";

  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const filteredNavMain = data.navMain.map(item => {
    if (item.title === "Configuración") {
      return {
        ...item,
        items: item.items?.filter(subItem => 
          subItem.title !== "Usuarios" || isAdmin
        )
      };
    }
    // Also hide Reportes if not admin
    if (item.title === "Reportes" && !isAdmin) {
      return null;
    }
    return item;
  }).filter(Boolean) as typeof data.navMain;

  if (!mounted) {
    return (
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader />
        <SidebarContent />
        <SidebarFooter />
      </Sidebar>
    );
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <CompanyHeader company={data.company} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNavMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user || data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
