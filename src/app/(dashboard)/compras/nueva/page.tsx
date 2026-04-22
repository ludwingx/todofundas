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
import { getSession } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import NewPurchaseClient from "./NewPurchaseClient";

export default async function NewPurchasePage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  // Fetch necessary data for the form
  const suppliers = await prisma.supplier.findMany({
    where: { status: "active" },
    select: { id: true, name: true }
  });

  const products = await prisma.product.findMany({
    where: { status: "active" },
    select: {
      id: true,
      costPrice: true,
      stock: true,
      phoneModel: { select: { name: true } },
      type: { select: { name: true } },
      color: { select: { name: true, hexCode: true } }
    }
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
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/compras">Compras</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Nueva Compra</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Registrar Pedido</h1>
          <p className="text-muted-foreground">Crea una nueva orden de compra a proveedor.</p>
        </div>
        <NewPurchaseClient suppliers={suppliers} products={products} />
      </div>
    </>
  );
}
