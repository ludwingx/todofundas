"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

type NavItem = {
  title: string
  url: string
  icon?: LucideIcon
  isActive?: boolean
  items?: {
    title: string
    url: string
  }[]
}

const STORAGE_KEY = "sidebar-nav-state"

function getStoredState(itemTitle: string): boolean | null {
  if (typeof window === "undefined") return null
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    const state = JSON.parse(stored)
    return state[itemTitle] ?? null
  } catch {
    return null
  }
}

function setStoredState(itemTitle: string, isOpen: boolean) {
  if (typeof window === "undefined") return
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    const state = stored ? JSON.parse(stored) : {}
    state[itemTitle] = isOpen
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Ignore storage errors
  }
}

function NavMenuItem({ item }: { item: NavItem }) {
  const pathname = usePathname()
  const [isMounted, setIsMounted] = useState(false)
  
  // Check if current path matches this item or any of its subitems
  const isCurrentPath = pathname === item.url || 
    (item.items?.some(subItem => pathname === subItem.url || pathname.startsWith(subItem.url + '/')) ?? false)
  
  // Initialize state as closed by default, will be updated in useEffect
  const [isOpen, setIsOpen] = useState(false)
  
  // Set initial state in useEffect to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true)
    const stored = getStoredState(item.title)
    if (stored !== null) {
      setIsOpen(stored)
    } else if (isCurrentPath) {
      setIsOpen(true)
    } else {
      setIsOpen(item.isActive || false)
    }
  }, [item.title, isCurrentPath, item.isActive])

  // Auto-open if navigating to a subitem
  useEffect(() => {
    if (isCurrentPath && !isOpen) {
      setIsOpen(true)
      setStoredState(item.title, true)
    }
  }, [pathname, isCurrentPath, isOpen, item.title])

  const handleToggle = (newState: boolean) => {
    setIsOpen(newState)
    setStoredState(item.title, newState)
  }

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={handleToggle}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <div className="flex items-center w-full">
          {/* Main navigation link */}
          <SidebarMenuButton asChild tooltip={item.title} className="flex-1">
            <Link href={item.url}>
              {item.icon && <item.icon className="h-4 w-4" />}
              <span>{item.title}</span>
            </Link>
          </SidebarMenuButton>
          
          {/* Collapsible trigger for submenu */}
          {item.items && item.items.length > 0 && (
            <CollapsibleTrigger asChild>
              <button 
                className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground"
                onClick={(e) => {
                  e.preventDefault()
                  handleToggle(!isOpen)
                }}
                aria-expanded={isOpen}
                data-state={isOpen ? "open" : "closed"}
              >
                <ChevronRight className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
              </button>
            </CollapsibleTrigger>
          )}
        </div>
        
        {item.items && item.items.length > 0 && isMounted && (
          <CollapsibleContent>
            <SidebarMenuSub>
              {item.items.map((subItem) => (
                <SidebarMenuSubItem key={subItem.title}>
                  <SidebarMenuSubButton asChild>
                    <Link href={subItem.url}>
                      <span>{subItem.title}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        )}
      </SidebarMenuItem>
    </Collapsible>
  )
}

export function NavMain({ items }: { items: NavItem[] }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Menú</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <NavMenuItem key={item.title} item={item} />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}

