import { redirect } from 'next/navigation'
import { getSession } from '@/app/actions/auth'
import { prisma } from '@/lib/prisma'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ShoppingBag, 
  Package, 
  Users, 
  Plus, 
  TrendingUp, 
  Clock,
  ArrowUpRight,
  ChevronRight,
  ClipboardCheck
} from "lucide-react"
import Link from "next/link"

export default async function PurchasesPage() {
  const session = await getSession()
  
  if (!session) {
    redirect('/login')
  }

  // Fetch real data
  const purchases = await prisma.purchase.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: {
      supplier: true,
      items: true
    }
  });

  const totalPurchasesAmount = purchases.reduce((sum, p) => sum + p.totalAmount, 0);
  const pendingPurchases = purchases.filter(p => p.status === 'pendiente').length;

  return (
    <>
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
                  <BreadcrumbLink href="/dashboard">Market GS</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Compras</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        
        <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
          {/* Header Section */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Compras a Proveedores</h1>
              <p className="text-muted-foreground">
                Gestiona los pedidos, la recepción de mercadería y los productos dañados.
              </p>
            </div>
            <Link href="/compras/nueva">
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Nueva Compra
              </Button>
            </Link>
          </div>

          {/* Purchase Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Inversión Reciente</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Bs. {totalPurchasesAmount.toFixed(2)}</div>
                <div className="flex items-center pt-1">
                  <p className="text-xs text-muted-foreground">Últimas 10 compras</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Órdenes Pendientes</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingPurchases}</div>
                <div className="flex items-center pt-1">
                  <Badge variant="outline" className="text-xs text-orange-600 border-orange-200 bg-orange-50 dark:bg-orange-950/20">Esperando Recepción</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <Link href="/compras/nueva">
              <Card className="group cursor-pointer transition-all hover:shadow-md h-full">
                <CardContent className="p-6 flex flex-col items-center justify-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Plus className="h-6 w-6 text-primary" />
                  </div>
                  <span className="font-medium text-center">Registrar Pedido (Nueva Compra)</span>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/configuracion/proveedores">
              <Card className="group cursor-pointer transition-all hover:shadow-md h-full">
                <CardContent className="p-6 flex flex-col items-center justify-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors dark:bg-blue-900/30">
                    <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="font-medium text-center">Gestionar Proveedores</span>
                </CardContent>
              </Card>
            </Link>

            <Link href="/wallet">
              <Card className="group cursor-pointer transition-all hover:shadow-md h-full">
                <CardContent className="p-6 flex flex-col items-center justify-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors dark:bg-purple-900/30">
                    <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="font-medium text-center">Wallet de Compensaciones</span>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Recent Purchases Table */}
          <Card>
            <CardHeader>
              <CardTitle>Historial de Compras</CardTitle>
              <CardDescription>Últimos pedidos realizados a proveedores</CardDescription>
            </CardHeader>
            <CardContent>
              {purchases.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                  <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Aún no hay compras registradas</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="p-3 font-medium">Fecha</th>
                        <th className="p-3 font-medium">Proveedor</th>
                        <th className="p-3 font-medium">Monto Total</th>
                        <th className="p-3 font-medium">Estado</th>
                        <th className="p-3 font-medium">Items</th>
                        <th className="p-3 font-medium text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {purchases.map(purchase => (
                        <tr key={purchase.id} className="hover:bg-muted/20 transition-colors">
                          <td className="p-3 text-muted-foreground">
                            {new Date(purchase.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-3 font-medium">{purchase.supplier?.name || "Desconocido"}</td>
                          <td className="p-3">Bs. {purchase.totalAmount.toFixed(2)}</td>
                          <td className="p-3">
                            <Badge variant={
                              purchase.status === "recibido" ? "default" :
                              purchase.status === "pendiente" ? "secondary" : "outline"
                            }>
                              {purchase.status}
                            </Badge>
                          </td>
                          <td className="p-3 text-muted-foreground">{purchase.items.length} productos</td>
                          <td className="p-3 text-right">
                            {purchase.status === "pendiente" ? (
                              <Link href={`/compras/${purchase.id}/recibir`}>
                                <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white">
                                  <ClipboardCheck className="w-4 h-4 mr-1" />
                                  Recibir y Revisar
                                </Button>
                              </Link>
                            ) : (
                              <Button size="sm" variant="outline" disabled>
                                Completado
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
    </>
  )
}