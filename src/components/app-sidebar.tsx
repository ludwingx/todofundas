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
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { CompanyHeader } from "@/components/company-header";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { title } from "process";

// Navigation data for marketgs system
const data = {
  user: {
    name: "Usuario",
    email: "usuario@marketgs.com",
    avatar: "/avatars/default.jpg",
  },
  company: {
    name: "Market GS",
    logo: Smartphone,
    plan: "By: Ludwing",
  },
  navMain: [
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
          title: "Proveedores",
          url: "/configuracion/proveedores",
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
  ],
};

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user?: { name: string; email: string; avatar: string; role?: string };
}) {
  const isAdmin = user?.role === "admin" || user?.role === "admin2";

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

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <CompanyHeader company={data.company} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNavMain} />
      </SidebarContent>
      <SidebarFooter>
        <ThemeToggle />
        <NavUser user={user || data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
