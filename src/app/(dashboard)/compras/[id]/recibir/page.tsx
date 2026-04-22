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
import ReceivePurchaseClient from "./ReceivePurchaseClient";

export default async function ReceivePurchasePage({
  params
}: {
  params: { id: string }
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const purchaseId = params.id;

  const purchase = await prisma.purchase.findUnique({
    where: { id: purchaseId },
    include: {
      supplier: true,
      items: {
        include: {
          product: {
            include: {
              phoneModel: true,
              type: true,
              color: true
            }
          }
        }
      }
    }
  });

  if (!purchase) notFound();

  // If already received completely or cancelled, maybe prevent receiving again.
  // But for now, let's just pass the data.
  
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
                <BreadcrumbPage>Recibir Pedido</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Filtro de Realidad</h1>
          <p className="text-muted-foreground">Declara la mercancía recibida vs. dañada del pedido #{purchase.id.slice(0, 8).toUpperCase()}</p>
        </div>
        <ReceivePurchaseClient purchase={purchase} />
      </div>
    </>
  );
}
