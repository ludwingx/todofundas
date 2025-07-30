import { redirect } from 'next/navigation'
import { getSession } from '@/app/actions/auth'
import { getDashboardMetrics, getRecentActivity } from '@/lib/dashboard-queries'
import { AppSidebar } from "@/components/app-sidebar"
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
  Package, 
  DollarSign, 
  AlertTriangle, 
  TrendingDown, 
  Eye, 
  Edit, 
  Trash2,
  BarChart3,
  History,
  Settings
} from "lucide-react"
import Link from "next/link"

export default async function InventoryPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const userData = {
    name: session.name as string,
    email: session.username as string,
    avatar: "/avatars/default.jpg",
  };

  // Obtener métricas reales de la base de datos
  const metrics = await getDashboardMetrics();
  const recentActivity = await getRecentActivity();

  return (
    <div className="flex h-screen w-full max-w-full overflow-x-hidden bg-background">
      <SidebarProvider>
        <AppSidebar user={userData} />
        <SidebarInset>
          <div className="flex flex-col h-screen overflow-x-hidden">
            {/* Sticky Header */}
            <header className="flex h-16 shrink-0 items-center gap-2">
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink href="/dashboard">TodoFundas</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage>Inventario</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </header>

            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
              {/* Header Section */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Inventario</h1>
                  <p className="text-muted-foreground">
                    Gestiona tus productos, stock y movimientos de inventario
                  </p>
                </div>
                <Button asChild>
                  <Link href="/inventory/products/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Producto
                  </Link>
                </Button>
              </div>

              {/* Inventory Stats */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                  title="Total Productos"
                  value={metrics.inventory.totalProducts}
                  icon={Package}
                  description="Productos registrados"
                />
                <MetricCard
                  title="Valor Inventario"
                  value={`Bs. ${metrics.inventory.totalValue.toLocaleString()}`}
                  description="Valor del inventario"
                  icon={DollarSign}
                />
                <MetricCard
                  title="Bajo Stock"
                  value={metrics.inventory.lowStockProducts}
                  description="Productos con stock < 5"
                  icon={AlertTriangle}
                  iconColor="text-orange-500"
                  valueColor={metrics.inventory.lowStockProducts > 0 ? "text-orange-600" : "text-foreground"}
                />
                <MetricCard
                  title="Sin Stock"
                  value={metrics.inventory.outOfStockProducts}
                  description="Productos agotados"
                  icon={TrendingDown}
                  iconColor="text-red-500"
                  valueColor={metrics.inventory.outOfStockProducts > 0 ? "text-red-600" : "text-foreground"}
                />
              </div>

              {/* Quick Actions */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <QuickActionCard
                  title="Nuevo Producto"
                  icon={Plus}
                  href="/inventory/products/new"
                />
                <QuickActionCard
                  title="Ver Productos"
                  icon={Eye}
                  href="/inventory/products"
                  variant="outline"
                />
                <QuickActionCard
                  title="Alertas Stock"
                  icon={AlertTriangle}
                  href="/inventory/alerts"
                  variant="outline"
                />
                <QuickActionCard
                  title="Movimientos"
                  icon={History}
                  href="/inventory/movements"
                  variant="outline"
                />
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Actividad Reciente</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-0">
                    {recentActivity.length > 0 ? (
                      recentActivity.slice(0, 5).map((activity) => (
                        <ActivityItem
                          key={activity.id}
                          title={activity.title}
                          description={activity.description}
                          timestamp={activity.timestamp}
                          icon={activity.type === 'entrada' ? Plus : activity.type === 'venta' ? TrendingDown : AlertTriangle}
                          iconColor={activity.type === 'entrada' ? 'text-green-600' : activity.type === 'venta' ? 'text-blue-600' : 'text-orange-600'}
                        >
                          <TableCell>Bs. {activity.priceRetail.toFixed(2)}</TableCell>
                        </ActivityItem>
                      ))
                    ) : (
                      <div className="py-8 text-center">
                        <Package className="mx-auto h-12 w-12 text-muted-foreground/50" />
                        <p className="mt-2 text-sm text-muted-foreground">No hay actividad reciente</p>
                        <p className="text-xs text-muted-foreground">Los movimientos de inventario aparecerán aquí</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}