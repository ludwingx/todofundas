"use client"

import * as React from "react"
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
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { CompanyHeader } from "@/components/company-header"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { title } from "process"

// Navigation data for Fundamania system
const data = {
  user: {
    name: "Usuario",
    email: "usuario@fundamania.com",
    avatar: "/avatars/default.jpg",
  },
  company: {
    name: "FundaMania",
    logo: Smartphone,
    plan: "i-ERP",
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
      url: "/sales",
      items: [
        {
          title: "Nueva Venta",
          url: "/sales/new"
        },
        {
          title: "Historial",
          url: "/sales"
        }
      ]
    },
    {
      title: "Inventario",
      icon: Package,
      url: "/inventory",
      items: [
        {
          title: "Productos",
          url: "/inventory/products"
        },
        {
          title: "Modelos",
          url: "/inventory/phone-models"
        },
        {
          title: "Colores",
          url: "/inventory/colors"
        },
        {
          title: "Tipos de Producto",
          url: "/inventory/types"
        },
        {
          title: "Movimientos",
          url: "/inventory/movements"
        },
      ]
    },
    {
      title: "Compras",
      icon: ShoppingBag,
      url: "/purchases",
      items:[
        {
          title: "Nueva Compra",
          url: "/purchases/new"
        },
        {
          title: "Historial de Compras",
          url: "/purchases"
        },
        {
          title: "Proveedores",
          url: "/purchases/providers"
        },
        {
          title: "Facturas",
          url: "/purchases/invoices"
        },
      ]
    },
    {
      title: "Reportes",
      icon: FileText,
      url: "/reports"
    },
  ],
}

export function AppSidebar({ user, ...props }: React.ComponentProps<typeof Sidebar> & { user?: { name: string; email: string; avatar: string } }) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <CompanyHeader company={data.company} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user || data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
