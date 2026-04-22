"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ThemeSwitchProps {
  className?: string
}

export function ThemeSwitch({ className }: ThemeSwitchProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const isDark = theme === "dark"

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn("h-9 w-9 rounded-full text-muted-foreground/60 hover:text-foreground hover:bg-muted/50 cursor-pointer", className)}
      title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
    >
      {isDark ? (
        <Moon className="h-[1.1rem] w-[1.1rem] transition-all" />
      ) : (
        <Sun className="h-[1.1rem] w-[1.1rem] transition-all" />
      )}
      <span className="sr-only">Alternar tema</span>
    </Button>
  )
}
