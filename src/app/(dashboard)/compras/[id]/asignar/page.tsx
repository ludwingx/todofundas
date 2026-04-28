import { notFound, redirect } from "next/navigation";
import { getSession } from "@/app/actions/auth";
import { prisma } from "@/lib/prisma";
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
import AssignStockClient from "./AssignStockClient";

export default async function AssignStockPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id: purchaseId } = await params;

  const purchase = await prisma.purchase.findUnique({
    where: { id: purchaseId },
    include: {
      supplier: true,
      items: {
        where: {
          productId: null,
          OR: [
            { quantityGood: { gt: 0 } },
            { quantityDamaged: { gt: 0 } }
          ]
        },
        include: {
          productType: true
        }
      }
    }
  });

  if (!purchase || purchase.items.length === 0) {
    // If no items pending assignment, redirect back
    redirect("/compras");
  }

  // Fetch all products to allow selection
  const products = await prisma.product.findMany({
    where: { status: "active" },
    include: {
      phoneModel: true,
      color: true,
      type: true
    },
    orderBy: [
      { type: { name: 'asc' } },
      { phoneModel: { name: 'asc' } }
    ]
  });

  // Fetch metadata for product creation dialog
  const [
    productTypes,
    suppliers,
    phoneModels,
    colors,
    materials,
    compatibilities,
  ] = await Promise.all([
    prisma.productType.findMany({ select: { id: true, name: true } }),
    prisma.supplier.findMany({ select: { id: true, name: true } }),
    prisma.phoneModel.findMany({ 
      select: { 
        id: true, 
        name: true,
        brand: { select: { name: true } }
      } 
    }),
    prisma.color.findMany({
      where: { status: "active" },
      select: { id: true, name: true, hexCode: true },
    }),
    prisma.material.findMany({
      where: { status: "active" },
      select: { id: true, name: true },
    }),
    prisma.compatibility.findMany({
      where: { status: "active" },
      select: { id: true, name: true, deviceType: true },
    }),
  ]);

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
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/compras">Compras</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Asignar Variantes</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="mb-4">
          <h1 className="text-3xl font-bold tracking-tight">Asignación de Variantes</h1>
          <p className="text-muted-foreground">Deriva el stock genérico a productos específicos registrados en el sistema.</p>
        </div>
        <AssignStockClient 
          purchase={purchase} 
          availableProducts={products}
          metadata={{
            productTypes,
            suppliers,
            phoneModels,
            colors,
            materials,
            compatibilities
          }}
        />
      </div>
    </>
  );
}
