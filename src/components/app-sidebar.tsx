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
    plan: "Sistema de Gestión",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: BarChart3,
      isActive: true,
    },
    {
      title: "Punto de Venta",
      url: "/sales",
      icon: ShoppingCart,
      items: [
        {
          title: "Nueva Venta",
          url: "/sales/new",
        },
      ],
    },
    {
      title: "Modelos Teléfono",
      url: "/phone-models",
      icon: Smartphone,
    },
    {
      title: "Inventario",
      url: "/inventory",
      icon: Package,
   
    },
    {
      title: "Productos",
      url: "/inventory/products",
      icon: Package,
    },
    {
      title: "Proveedores",
      url: "/inventory/providers",
      icon: Users,
    },
    
    {
      title: "Compras",
      url: "/purchases",
      icon: ShoppingBag,
    },
    {
      title: "Reportes",
      url: "/reports",
      icon: FileText,
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
