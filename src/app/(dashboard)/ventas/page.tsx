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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
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

  // 1. Fetch Today's Sales con color del producto
  const todaySales = await db.sale.findMany({
    where: {
      createdAt: {
        gte: startOfToday,
        lte: endOfTodayDate
      }
    },
    include: {
      product: {
        include: { type: true, phoneModel: true, color: true }
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
  
  // Agrupar por transactionId para contar tickets reales del día
  const uniqueTransactions = new Set(todaySales.map(s => s.transactionId || s.id)).size
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

  // Agrupar ventas por transactionId (cada carrito tiene el mismo UUID)
  const groupedSales: Record<string, typeof todaySales> = {}
  todaySales.forEach(sale => {
    // Fallback: si es venta antigua sin transactionId, usar el id individual
    const key = sale.transactionId || sale.id
    if (!groupedSales[key]) groupedSales[key] = []
    groupedSales[key].push(sale)
  })

  const sortedTransactions = Object.entries(groupedSales)
    .map(([txId, items]) => ({
      id: txId,
      timestamp: items[0].createdAt.getTime(),
      items,
      total: items.reduce((sum, item) => sum + item.totalPrice, 0),
      discount: items.reduce((sum, item) => sum + (item.discountApplied || 0), 0),
      discountPercentage: items.find(i => i.discountPercentage)?.discountPercentage || null,
      customer: items[0].customerName || 'Consumidor Final',
      phone: items[0].customerPhone,
      method: items[0].paymentMethod
    }))
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 15)

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
            <div className="text-2xl font-bold">Bs. {ventasHoy.toFixed(2)}</div>
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
            <div className="text-2xl font-bold">Bs. {ticketPromedio.toFixed(2)}</div>
          </div>
          
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="tracking-tight text-sm font-medium">Ventas del Mes</h3>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">Bs. {ventasMes.toFixed(2)}</div>
          </div>
        </div>

        {/* Recent Sales Transactions (Tickets) */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Últimas 10 Ventas Realizadas</h3>
          
          {sortedTransactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No hay ventas registradas el día de hoy.</p>
          ) : (
            <Accordion type="single" collapsible className="w-full space-y-2">
              {sortedTransactions.map((ticket, index) => (
                <AccordionItem key={ticket.id} value={`ticket-${ticket.id}`} className="border rounded-lg px-4 bg-muted/20">
                  <AccordionTrigger className="hover:no-underline py-3 cursor-pointer">
                    <div className="flex flex-1 items-center justify-between pr-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center shrink-0">
                          <ShoppingCart className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold">
                            {ticket.customer}
                            <span className="ml-2 text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full capitalize">
                              {ticket.method}
                            </span>
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {ticket.items.length} {ticket.items.length === 1 ? 'producto' : 'productos'} • {formatDistanceToNow(new Date(ticket.timestamp), { addSuffix: true, locale: es })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-green-600 dark:text-green-400">Bs. {ticket.total.toFixed(2)}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">Ticket</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4">
                    <div className="pl-14 pr-4 space-y-3">
                      <div className="grid grid-cols-12 gap-4 font-bold text-xs uppercase text-muted-foreground border-b pb-2">
                        <div className="col-span-8">Producto</div>
                        <div className="col-span-2 text-center">Cant.</div>
                        <div className="col-span-2 text-right">Subtotal</div>
                      </div>
                      {ticket.items.map(sale => (
                        <div key={sale.id} className="grid grid-cols-12 gap-4 items-center text-sm border-b border-dashed border-muted pb-2 last:border-0 last:pb-0">
                          <div className="col-span-8">
                            <span className="font-medium">{sale.product.type.name} {sale.product.phoneModel.name}</span>
                            {sale.notes && (
                              <p className="text-xs text-muted-foreground italic mt-0.5 text-red-500/80">
                                {sale.notes.replace('Venta de stock dañado', 'Dañado')}
                              </p>
                            )}
                          </div>
                          <div className="col-span-2 text-center text-muted-foreground">
                            x{sale.quantity}
                          </div>
                          <div className="col-span-2 text-right font-medium">
                            Bs. {sale.totalPrice.toFixed(2)}
                          </div>
                        </div>
                      ))}
                      {ticket.discount > 0 && (
                        <div className="mt-2 pt-2 border-t border-muted">
                          <div className="flex justify-between items-center text-sm mb-1">
                            <span className="text-muted-foreground uppercase text-xs tracking-widest">Subtotal Original</span>
                            <span>Bs. {(ticket.total + ticket.discount).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm font-medium mb-1">
                            <span className="text-red-500/80 uppercase text-xs tracking-widest">
                              Descuento Aplicado {ticket.discountPercentage ? `(${ticket.discountPercentage}%)` : ''}
                            </span>
                            <span className="text-red-500">- Bs. {ticket.discount.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm font-bold mt-2">
                            <span className="uppercase text-xs tracking-widest">Total Pagado</span>
                            <span className="text-green-600 dark:text-green-400">Bs. {ticket.total.toFixed(2)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
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
                  <span className="text-sm font-medium">Bs. {amount.toFixed(2)}</span>
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
