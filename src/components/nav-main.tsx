"use client";

import { type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

type NavItem = {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  items?: {
    title: string;
    url: string;
  }[];
};

function NavMenuItem({ item }: { item: NavItem }) {
  const pathname = usePathname();

  // Check if current path matches this item or any of its subitems
  const isCurrentPath =
    pathname === item.url ||
    (item.items?.some(
      (subItem) =>
        pathname === subItem.url || pathname.startsWith(subItem.url + "/"),
    ) ??
      false);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton 
        asChild 
        tooltip={item.title} 
        isActive={isCurrentPath && !item.items}
      >
        <Link href={item.url}>
          {item.icon && <item.icon className="h-4 w-4" />}
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>

      {item.items && item.items.length > 0 && (
        <SidebarMenuSub>
          {item.items.map((subItem) => (
            <SidebarMenuSubItem key={subItem.title}>
              <SidebarMenuSubButton 
                asChild
                isActive={pathname === subItem.url || pathname.startsWith(subItem.url + "/")}
              >
                <Link href={subItem.url}>
                  <span>{subItem.title}</span>
                </Link>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      )}
    </SidebarMenuItem>
  );
}

export function NavMain({ items }: { items: NavItem[] }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Menú Principal</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <NavMenuItem key={item.title} item={item} />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
