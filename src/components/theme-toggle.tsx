"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Switch } from "@/components/ui/switch"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const { state } = useSidebar()
  const isDark = theme === "dark"
  const isCollapsed = state === "collapsed"

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark")
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton 
          asChild 
          className="flex items-center justify-between hover:bg-transparent"
        >
          <div className="flex w-full items-center justify-between px-2 cursor-pointer" onClick={toggleTheme}>
            <div className="flex items-center gap-2">
              {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              {!isCollapsed && (
                <span className="text-sm font-medium">Modo Oscuro</span>
              )}
            </div>
            {!isCollapsed && (
              <Switch 
                checked={isDark} 
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                className="scale-75"
              />
            )}
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
