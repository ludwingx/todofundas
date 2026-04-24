"use client"

import * as React from "react"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import { ForcedMarketLogo } from "@/components/brand-logo"

export function CompanyHeader({
  company,
}: {
  company: {
    name: string
    logo: React.ElementType
    plan: string
  }
}) {
  if (!company) {
    return null
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" className="cursor-default hover:bg-transparent">
          <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-black dark:bg-white border border-black/10 dark:border-white/10">
            {/* Modo claro: fondo negro → logo blanco */}
            <ForcedMarketLogo variant="light" className="size-7 dark:hidden" />
            {/* Modo oscuro: fondo blanco → logo negro */}
            <ForcedMarketLogo variant="dark" className="size-7 hidden dark:block" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight ml-2">
            <span className="truncate font-black uppercase tracking-tighter text-lg leading-none">
              {company.name.replace('/', '')}
            </span>
            <span className="truncate text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-70">
              {company.plan}
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
