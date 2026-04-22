import { redirect } from 'next/navigation'
import { getSession } from '@/app/actions/auth'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  FileText, 
  Download, 
  BarChart3, 
  TrendingUp, 
  Calendar,
  Filter,
  Eye,
  Package
} from "lucide-react"
import Link from "next/link"

import { prisma } from '@/lib/prisma'

export default async function ReportsPage() {
  const session = await getSession()
  
  if (!session) {
    redirect('/login')
  }
  
  const userData = {
    name: session.name as string,
    email: session.username as string,
    avatar: "/avatars/default.jpg",
  }

  // Get start of current month
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  // Fetch sales from this month
  const currentMonthSales = await prisma.sale.findMany({
    where: {
      createdAt: {
        gte: startOfMonth
      }
    },
    include: {
      product: {
        select: { costPrice: true }
      }
    }
  })

  // Fetch Wallet transactions (ingresos y egresos) for this month
  const currentMonthWallet = await prisma.walletTransaction.findMany({
    where: {
      createdAt: {
        gte: startOfMonth
      }
    }
  })

  const totalRevenue = currentMonthSales.reduce((sum, sale) => sum + sale.totalPrice, 0)
  const totalProductsSold = currentMonthSales.reduce((sum, sale) => sum + sale.quantity, 0)
  const costOfGoodsSold = currentMonthSales.reduce((sum, sale) => sum + ((sale.product?.costPrice || 0) * sale.quantity), 0)
  
  const walletIngresos = currentMonthWallet.filter(t => t.type === 'ingreso').reduce((sum, t) => sum + t.amount, 0)
  const walletEgresos = currentMonthWallet.filter(t => t.type === 'egreso').reduce((sum, t) => sum + t.amount, 0)

  // Ganancia Neta Real = Ventas Brutas - Costo de la Mercadería Vendida + Ingresos Extra - Mermas/Gastos
  const netProfit = totalRevenue - costOfGoodsSold + walletIngresos - walletEgresos
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0

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
                  <BreadcrumbLink href="/dashboard">
                  Market GS
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Reportes</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Reportes</h1>
              <p className="text-muted-foreground">
                Analiza el rendimiento real de tu negocio
              </p>
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filtros Avanzados
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
              <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="tracking-tight text-sm font-medium">Ingresos Brutos (Mes)</h3>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">Bs. {totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Suma de todas las ventas</p>
            </div>
            
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
              <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="tracking-tight text-sm font-medium">Ganancia Neta Real</h3>
                <BarChart3 className="h-4 w-4 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-600">Bs. {netProfit.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Ingresos menos costo de mercadería</p>
            </div>
            
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
              <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="tracking-tight text-sm font-medium">Margen de Ganancia</h3>
                <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="text-2xl font-bold">{profitMargin.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Promedio del mes</p>
            </div>
            
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
              <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="tracking-tight text-sm font-medium">Productos Vendidos</h3>
                <Package className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">{totalProductsSold}</div>
              <p className="text-xs text-muted-foreground">Unidades físicas</p>
            </div>
          </div>

          {/* Report Categories */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Sales Reports */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Reportes de Ventas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                  <div>
                    <h4 className="font-medium">Ventas por Período</h4>
                    <p className="text-sm text-muted-foreground">Análisis de ventas diarias, semanales y mensuales</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                  <div>
                    <h4 className="font-medium">Productos Más Vendidos</h4>
                    <p className="text-sm text-muted-foreground">Top productos por cantidad y valor</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                  <div>
                    <h4 className="font-medium">Análisis de Clientes</h4>
                    <p className="text-sm text-muted-foreground">Comportamiento y preferencias de clientes</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Inventory Reports */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  Reportes de Inventario
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                  <div>
                    <h4 className="font-medium">Estado de Stock</h4>
                    <p className="text-sm text-muted-foreground">Niveles actuales de inventario por producto</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                  <div>
                    <h4 className="font-medium">Movimientos de Inventario</h4>
                    <p className="text-sm text-muted-foreground">Historial de entradas y salidas</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                  <div>
                    <h4 className="font-medium">Valoración de Inventario</h4>
                    <p className="text-sm text-muted-foreground">Valor total y por categorías</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Purchase Reports */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Reportes de Compras
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                  <div>
                    <h4 className="font-medium">Compras por Proveedor</h4>
                    <p className="text-sm text-muted-foreground">Análisis de compras por proveedor</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                  <div>
                    <h4 className="font-medium">Costos y Márgenes</h4>
                    <p className="text-sm text-muted-foreground">Análisis de rentabilidad por producto</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                  <div>
                    <h4 className="font-medium">Historial de Órdenes</h4>
                    <p className="text-sm text-muted-foreground">Registro completo de compras</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Reports / Actions */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Generador de Reportes (Próximamente)</h3>
            </div>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium">Exportación en PDF/Excel</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                La exportación automática de todos estos datos en formatos PDF y hojas de cálculo se implementará en la próxima actualización.
              </p>
            </div>
          </div>
        </div>
      </>
  )
}
