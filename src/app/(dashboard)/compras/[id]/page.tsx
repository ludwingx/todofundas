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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Calendar, User, FileText, ShoppingCart, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import EditPurchaseQuantities from "./EditPurchaseQuantities";

export default async function PurchaseDetailsPage({
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
        include: {
          product: {
            include: {
              phoneModel: true,
              color: true,
              type: true
            }
          },
          productType: true
        }
      }
    }
  });

  if (!purchase) notFound();

  // Fetch products for the edit dialog
  const availableProducts = await prisma.product.findMany({
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

  const totalOrdered = purchase.items.reduce((sum, i) => sum + i.quantityOrdered, 0);
  const totalGood = purchase.items.reduce((sum, i) => sum + i.quantityGood, 0);
  const totalDamaged = purchase.items.reduce((sum, i) => sum + i.quantityDamaged, 0);

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
                <BreadcrumbPage>Detalles del Pedido</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
        {/* Purchase Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-bold tracking-tight">Pedido #{purchase.id.slice(0, 8).toUpperCase()}</h1>
              <Badge variant={purchase.status === "recibido" ? "default" : "secondary"}>
                {purchase.status.toUpperCase()}
              </Badge>
            </div>
            <p className="text-muted-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Registrado el {new Date(purchase.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-3">
             <EditPurchaseQuantities purchase={purchase} availableProducts={availableProducts} />
             {purchase.status === "pendiente" && (
                <Link href={`/compras/${purchase.id}/recibir`}>
                  <Button className="bg-orange-600 hover:bg-orange-700">
                    Recibir Mercadería
                  </Button>
                </Link>
             )}
             {purchase.items.some(i => !i.productId && (i.quantityGood > 0 || i.quantityDamaged > 0)) && (
                <Link href={`/compras/${purchase.id}/asignar`}>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Asignar Variantes
                  </Button>
                </Link>
             )}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Summary Cards */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Monto Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">Bs. {purchase.totalAmount.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">Inversión en inventario</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Proveedor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{purchase.supplier.name}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <User className="w-3 h-3" /> {purchase.supplier.contact || 'Sin contacto'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Resumen de Carga</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3 items-center">
                <div className="flex flex-col">
                  <span className="text-lg font-bold">{totalOrdered}</span>
                  <span className="text-[10px] uppercase text-muted-foreground font-bold">Pedidas</span>
                </div>
                <div className="h-8 w-px bg-border"></div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-green-600">{totalGood}</span>
                  <span className="text-[10px] uppercase text-muted-foreground font-bold">Bien</span>
                </div>
                <div className="h-8 w-px bg-border"></div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-amber-600">{totalDamaged}</span>
                  <span className="text-[10px] uppercase text-muted-foreground font-bold">Dañado</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Items Table */}
        <Card>
          <CardHeader>
            <CardTitle>Productos del Pedido</CardTitle>
            <CardDescription>Detalle de cada item solicitado y recibido</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-muted/50 border-y">
                  <tr>
                    <th className="p-4 font-medium">Producto / Tipo</th>
                    <th className="p-4 font-medium text-center">Pedida</th>
                    <th className="p-4 font-medium text-center text-green-600">Bien</th>
                    <th className="p-4 font-medium text-center text-amber-600">Dañado</th>
                    <th className="p-4 font-medium text-center">Total Recibido</th>
                    <th className="p-4 font-medium text-right">Variante Asignada</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {purchase.items.map((item) => {
                    const totalReceived = item.quantityGood + item.quantityDamaged;
                    const isFullyAssigned = !!item.productId;
                    const isPending = (item.quantityGood > 0 || item.quantityDamaged > 0) && !item.productId;

                    return (
                      <tr key={item.id} className="hover:bg-muted/10 transition-colors">
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="font-semibold">
                              {item.product 
                                ? `${item.product.type.name} ${item.product.phoneModel.name}`
                                : item.productType?.name || 'Producto'}
                            </span>
                            {item.product?.color && (
                              <span className="text-[10px] text-muted-foreground uppercase font-medium">
                                Color: {item.product.color.name}
                              </span>
                            )}
                            {item.productId && (
                               <span className="text-[10px] text-green-600 font-bold uppercase mt-0.5">
                                 Stock Asignado
                               </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-center font-medium">{item.quantityOrdered}</td>
                        <td className="p-4 text-center font-bold text-green-600">{item.quantityGood || '-'}</td>
                        <td className="p-4 text-center font-bold text-amber-600">{item.quantityDamaged || '-'}</td>
                        <td className="p-4 text-center">
                          <Badge variant={totalReceived === item.quantityOrdered ? "outline" : "secondary"} className="font-bold">
                            {totalReceived}
                          </Badge>
                        </td>
                        <td className="p-4 text-right">
                          {item.product ? (
                            <div className="flex flex-col items-end">
                              <span className="font-medium">{item.product.phoneModel.name}</span>
                              <span className="text-xs text-muted-foreground">{item.product.color?.name || 'Sin Color'}</span>
                            </div>
                          ) : isPending ? (
                            <Badge variant="destructive" className="bg-amber-100 text-amber-700 border-amber-200 animate-pulse">
                              <AlertCircle className="w-3 h-3 mr-1" /> Pendiente Asignar
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground italic">No aplica</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {purchase.notes && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FileText className="w-4 h-4" /> Notas del Pedido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground italic">"{purchase.notes}"</p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
