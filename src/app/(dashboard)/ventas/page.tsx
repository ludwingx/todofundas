import { redirect } from 'next/navigation'
import { getSession } from '@/app/actions/auth'
import { prisma as db } from '@/lib/prisma'
import { startOfDay, startOfMonth, endOfDay } from 'date-fns'

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
import { Plus, ShoppingCart, TrendingUp, DollarSign, Clock, Package } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

export default async function SalesPage() {
  const session = await getSession()
  
  if (!session) {
    redirect('/login')
  }
  
  const today = new Date()
  const startOfToday = startOfDay(today)
  const endOfTodayDate = endOfDay(today)
  const startOfThisMonth = startOfMonth(today)

  // 1. Fetch Today's Sales
  const todaySales = await db.sale.findMany({
    where: {
      createdAt: {
        gte: startOfToday,
        lte: endOfTodayDate
      }
    },
    include: {
      product: {
        include: { type: true, phoneModel: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  // 2. Fetch Month's Sales for Total
  const monthSalesAggregate = await db.sale.aggregate({
    _sum: { totalPrice: true },
    where: {
      createdAt: { gte: startOfThisMonth }
    }
  })

  // Calculate Metrics
  const ventasHoy = todaySales.reduce((sum, sale) => sum + sale.totalPrice, 0)
  
  // Since each sold item is an individual Sale record, we group by exact timestamp to estimate distinct "tickets/transactions"
  const uniqueTransactions = new Set(todaySales.map(s => s.createdAt.getTime())).size
  const transaccionesHoy = uniqueTransactions
  const ticketPromedio = transaccionesHoy > 0 ? ventasHoy / transaccionesHoy : 0
  
  const ventasMes = monthSalesAggregate._sum.totalPrice || 0

  // Calculate Payment Methods
  const paymentMethods: Record<string, number> = {}
  todaySales.forEach(sale => {
    paymentMethods[sale.paymentMethod] = (paymentMethods[sale.paymentMethod] || 0) + sale.totalPrice
  })

  // Calculate Top Products Today
  const productSales: Record<string, { name: string, quantity: number }> = {}
  todaySales.forEach(sale => {
    const name = `${sale.product.type.name} ${sale.product.phoneModel.name}`
    if (!productSales[sale.productId]) {
      productSales[sale.productId] = { name, quantity: 0 }
    }
    productSales[sale.productId].quantity += sale.quantity
  })
  const topProducts = Object.values(productSales).sort((a, b) => b.quantity - a.quantity).slice(0, 3)

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">Market GS</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Ventas</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Historial de Ventas</h1>
            <p className="text-muted-foreground">Monitoreo de transacciones en tiempo real</p>
          </div>
          <Button asChild>
            <Link href="/ventas/nueva">
              <Plus className="mr-2 h-4 w-4" />
              Nueva Venta
            </Link>
          </Button>
        </div>

        {/* Sales Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="tracking-tight text-sm font-medium">Ventas Hoy</h3>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">${ventasHoy.toFixed(2)}</div>
          </div>
          
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="tracking-tight text-sm font-medium">Tickets Hoy</h3>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{transaccionesHoy}</div>
          </div>
          
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="tracking-tight text-sm font-medium">Ticket Promedio</h3>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">${ticketPromedio.toFixed(2)}</div>
          </div>
          
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="tracking-tight text-sm font-medium">Ventas del Mes</h3>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">${ventasMes.toFixed(2)}</div>
          </div>
        </div>

        {/* Recent Sales Items */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Últimos 10 Productos Vendidos</h3>
          <div className="space-y-3">
            {todaySales.slice(0, 10).map(sale => (
              <div key={sale.id} className="flex items-center justify-between py-3 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Package className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {sale.product.type.name} {sale.product.phoneModel.name}
                      <span className="text-muted-foreground text-xs ml-2">
                        (x{sale.quantity})
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Cliente: {sale.customerName || 'Consumidor Final'} 
                      {sale.customerPhone && ` - ${sale.customerPhone}`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">${sale.totalPrice.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(sale.createdAt), { addSuffix: true, locale: es })}
                  </p>
                </div>
              </div>
            ))}
            {todaySales.length === 0 && (
              <p className="text-center text-muted-foreground py-4">No hay ventas registradas el día de hoy.</p>
            )}
          </div>
        </div>

        {/* Top Products and Payment Methods */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Productos Más Vendidos Hoy</h3>
            <div className="space-y-3">
              {topProducts.map((p, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm">{p.name}</span>
                  </div>
                  <span className="text-sm font-medium">{p.quantity} unidades</span>
                </div>
              ))}
              {topProducts.length === 0 && (
                <p className="text-sm text-muted-foreground">No hay datos suficientes.</p>
              )}
            </div>
          </div>
          
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Ingresos por Método de Pago Hoy</h3>
            <div className="space-y-3">
              {Object.entries(paymentMethods).map(([method, amount], i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-secondary rounded-full"></div>
                    <span className="text-sm capitalize">{method}</span>
                  </div>
                  <span className="text-sm font-medium">${amount.toFixed(2)}</span>
                </div>
              ))}
              {Object.keys(paymentMethods).length === 0 && (
                <p className="text-sm text-muted-foreground">No hay pagos registrados hoy.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
