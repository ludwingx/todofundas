import { redirect } from "next/navigation";
import { getSession } from "@/app/actions/auth";

import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import {
  Smartphone,
  Palette,
  Package,
  Layers,
  Link2,
  Truck,
  Settings,
} from "lucide-react";

export default async function SettingsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const userData = {
    name: session.name as string,
    email: session.username as string,
    avatar: "/avatars/default.jpg",
  };

  const configModules = [
    {
      title: "Modelos de Teléfono",
      description: "Administra los modelos compatibles con tus productos.",
      href: "/inventory/phone-models",
      icon: Smartphone,
    },
    {
      title: "Colores",
      description: "Gestiona la paleta de colores disponible para tu inventario.",
      href: "/inventory/colors",
      icon: Palette,
    },
    {
      title: "Tipos de Producto",
      description: "Configura los tipos y categorías de productos.",
      href: "/inventory/types",
      icon: Package,
    },
    {
      title: "Materiales",
      description: "Define los materiales utilizados en tus productos.",
      href: "/inventory/materials",
      icon: Layers,
    },
    {
      title: "Compatibilidad",
      description: "Relaciona productos con modelos de teléfonos compatibles.",
      href: "/inventory/compatibility",
      icon: Link2,
    },
    {
      title: "Proveedores",
      description: "Administra tus proveedores y fuentes de compra.",
      href: "/purchases/providers",
      icon: Truck,
    },
  ];

  return (
    <SidebarProvider>
      <AppSidebar user={userData} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">FundaMania</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Configuración</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Centro de Configuración
              </h2>
              <p className="text-muted-foreground mt-2 max-w-2xl">
                Administra los catálogos y parámetros del sistema que se utilizan en
                ventas, compras e inventario.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {configModules.map((module) => (
              <Link key={module.href} href={module.href} className="group">
                <Card className="h-full transition-colors group-hover:border-primary/60">
                  <CardHeader className="flex flex-row items-center gap-3 pb-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <module.icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-base font-semibold">
                      {module.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 text-sm text-muted-foreground">
                    {module.description}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
