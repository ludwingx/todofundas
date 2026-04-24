import { Suspense } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import CatalogManagementClient from "./CatalogManagementClient";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/app/actions/auth";
import { redirect } from "next/navigation";

export default async function CatalogPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  // Fetch all active products with their details
  const products = await prisma.product.findMany({
    where: {
      status: "active",
    },
    include: {
      phoneModel: true,
      type: true,
      color: { select: { name: true } },
      images: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">Market GS</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Gestión de Catálogo</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestión de Catálogo Web</h1>
            <p className="text-muted-foreground">Controla la visibilidad y precios de exhibición en tu tienda pública.</p>
          </div>
        </div>
        
        <Suspense fallback={<div>Cargando catálogo...</div>}>
          <CatalogManagementClient initialProducts={products as any} />
        </Suspense>
      </div>
    </>
  );
}
