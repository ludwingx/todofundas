"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

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

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const [isOpen, setIsOpen] = useState(item.isActive || false)
          
          return (
            <Collapsible
              key={item.title}
              open={isOpen}
              onOpenChange={setIsOpen}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <div className="flex items-center w-full">
                  {/* Main navigation link */}
                  <SidebarMenuButton asChild tooltip={item.title} className="flex-1">
                    <Link href={item.url}>
                      {item.icon && <item.icon />}
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
                          setIsOpen(!isOpen)
                        }}
                      >
                        <ChevronRight className="h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </button>
                    </CollapsibleTrigger>
                  )}
                </div>
                
                {item.items && item.items.length > 0 && (
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
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
