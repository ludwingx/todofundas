import { redirect } from 'next/navigation'
import { getSession } from '@/app/actions/auth'
import { getDashboardMetrics, getRecentActivity, getTopProducts } from '@/lib/dashboard-queries'
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MetricCard } from "@/components/ui/metric-card"
import { QuickActionCard } from "@/components/ui/quick-action-card"
import { ActivityItem } from "@/components/ui/activity-item"
import { 
  Plus, 
  BarChart3, 
  ShoppingCart, 
  Package, 
  TrendingUp, 
  DollarSign,
  AlertTriangle,
  ShoppingBag,
  FileText,
  Edit,
  ArrowUpDown
} from "lucide-react"
import Link from "next/link"
import { Separator } from '@/components/ui/separator'

export default async function Page() {
  const session = await getSession()
  
  if (!session) {
    redirect('/login')
  }
  
  const userData = {
    name: session.name as string,
    email: session.username as string,
    avatar: "/avatars/default.jpg", // Obtener datos reales de la base de datos
  }

  const metrics = await getDashboardMetrics()
  const recentActivity = await getRecentActivity()
  const topProducts = await getTopProducts()

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
                  <BreadcrumbLink href="/dashboard">
                    TodoFundas
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Dashboard</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* Welcome Section */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h2 className="text-2xl font-bold tracking-tight">¡Bienvenido {userData.name} 👋 a TodoFundas!</h2>
            <p className="text-muted-foreground mt-2">
              Sistema de gestión para fundas y protectores de pantalla.
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Ventas del Mes"
              value={`Bs. ${metrics.sales.monthlyRevenue.toLocaleString()}`}
              description={`${metrics.sales.monthlyTransactions} transacciones`}
              icon={DollarSign}
              iconColor="text-green-500"
            />
            
            <MetricCard
              title="Total Productos"
              value={metrics.inventory.totalProducts}
              description="En inventario"
              icon={Package}
            />
            
            <MetricCard
              title="Valor Inventario"
              value={`Bs. ${metrics.inventory.totalValue.toLocaleString()}`}
              description="Valor total del stock"
              icon={BarChart3}
            />
            
            <MetricCard
              title="Stock Bajo"
              value={metrics.inventory.lowStockProducts}
              description={`${metrics.inventory.outOfStockProducts} agotados`}
              icon={AlertTriangle}
              iconColor="text-orange-500"
              valueColor={metrics.inventory.lowStockProducts > 0 ? "text-orange-600" : "text-foreground"}
            />
          </div>

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <QuickActionCard
              title="Nueva Venta"
              icon={Plus}
              href="/sales/new"
            />
            
            <QuickActionCard
              title="Nuevo Producto"
              icon={Package}
              href="/inventory/products"
              variant="outline"
            />
            
            <QuickActionCard
              title="Ver Inventario"
              icon={BarChart3}
              href="/inventory"
              variant="outline"
            />
            
            <QuickActionCard
              title="Reportes"
              icon={FileText}
              href="/reports"
              variant="outline"
            />
          </div>

          {/* Recent Activity and Top Products */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Actividad Reciente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-0">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity) => (
                      <ActivityItem
                        key={activity.id}
                        title={activity.title}
                        description={activity.description}
                        timestamp={activity.timestamp}
                        icon={activity.type === 'entrada' ? Plus : activity.type === 'venta' ? ShoppingCart : ArrowUpDown}
                        iconColor={activity.type === 'entrada' ? 'text-green-600' : activity.type === 'venta' ? 'text-blue-600' : 'text-gray-600'}
                      />
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground py-4">No hay actividad reciente</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Productos Destacados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topProducts.length > 0 ? (
                    topProducts.map((product, index) => (
                      <div key={product.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            index === 0 ? 'bg-blue-500' :
                            index === 1 ? 'bg-green-500' :
                            index === 2 ? 'bg-orange-500' :
                            index === 3 ? 'bg-purple-500' :
                            'bg-gray-500'
                          }`}></div>
                          <span className="text-sm">{product.name} {product.phoneModel?.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-medium">{product.totalSold} vendidos</span>
                          <p className="text-xs text-muted-foreground">{product.stock} en stock</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground py-4">No hay productos para mostrar</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
