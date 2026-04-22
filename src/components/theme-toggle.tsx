"use client"

import * as React from "react"
import { useSidebar } from "@/components/ui/sidebar"
import { ThemeSwitch } from "@/components/theme-switch"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function ThemeToggle() {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton 
          asChild 
          className="flex items-center justify-between hover:bg-transparent h-12"
        >
          <div className="flex w-full items-center justify-center">
            <ThemeSwitch />
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
