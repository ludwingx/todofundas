import { redirect } from 'next/navigation'
import { getSession } from '@/app/actions/auth'
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
import { Plus, ShoppingCart, TrendingUp, DollarSign, Clock } from "lucide-react"
import Link from "next/link"

export default async function SalesPage() {
  const session = await getSession()
  
  if (!session) {
    redirect('/login')
  }
  
  const userData = {
    name: session.name as string,
    email: session.username as string,
    avatar: "/avatars/default.jpg",
  }

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
                  FundaMania
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Punto de Venta</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Punto de Venta</h1>
              <p className="text-muted-foreground">
                Gestiona las ventas de fundas y protectores
              </p>
            </div>
            <Button asChild>
              <Link href="/sales/new">
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
              <div className="text-2xl font-bold">$2,350</div>
              <p className="text-xs text-muted-foreground">+20.1% desde ayer</p>
            </div>
            
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
              <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="tracking-tight text-sm font-medium">Transacciones</h3>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">47</div>
              <p className="text-xs text-muted-foreground">+12 desde ayer</p>
            </div>
            
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
              <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="tracking-tight text-sm font-medium">Ticket Promedio</h3>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">$50.00</div>
              <p className="text-xs text-muted-foreground">+5% vs promedio</p>
            </div>
            
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
              <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="tracking-tight text-sm font-medium">Ventas del Mes</h3>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">$45,231</div>
              <p className="text-xs text-muted-foreground">+12% vs mes anterior</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Button asChild className="h-20 flex-col gap-2">
              <Link href="/sales/new">
                <Plus className="h-6 w-6" />
                <span>Nueva Venta</span>
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="h-20 flex-col gap-2">
              <Link href="/sales/quick">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Venta Rápida</span>
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="h-20 flex-col gap-2">
              <Link href="/sales/summary">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Resumen Ventas</span>
              </Link>
            </Button>
          </div>

          {/* Recent Sales */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Ventas Recientes</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-3 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <ShoppingCart className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Funda iPhone 14 Pro + Protector</p>
                    <p className="text-xs text-muted-foreground">Cliente: María González</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">$28.98</p>
                  <p className="text-xs text-muted-foreground">Hace 15 min</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <ShoppingCart className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Protector Samsung S23</p>
                    <p className="text-xs text-muted-foreground">Cliente: Carlos Ruiz</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">$12.99</p>
                  <p className="text-xs text-muted-foreground">Hace 32 min</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <ShoppingCart className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Funda Xiaomi Redmi Note 12</p>
                    <p className="text-xs text-muted-foreground">Cliente: Ana López</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">$8.99</p>
                  <p className="text-xs text-muted-foreground">Hace 1 hora</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <ShoppingCart className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Funda Cuero iPhone 13</p>
                    <p className="text-xs text-muted-foreground">Cliente: Pedro Martín</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">$24.99</p>
                  <p className="text-xs text-muted-foreground">Hace 2 horas</p>
                </div>
              </div>
            </div>
          </div>

          {/* Top Products */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Productos Más Vendidos Hoy</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Funda iPhone 14 Pro</span>
                  </div>
                  <span className="text-sm font-medium">12 unidades</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Protector Samsung S23</span>
                  </div>
                  <span className="text-sm font-medium">8 unidades</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-sm">Funda Xiaomi Redmi</span>
                  </div>
                  <span className="text-sm font-medium">6 unidades</span>
                </div>
              </div>
            </div>
            
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Métodos de Pago Hoy</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Efectivo</span>
                  </div>
                  <span className="text-sm font-medium">$1,420 (60%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Tarjeta</span>
                  </div>
                  <span className="text-sm font-medium">$710 (30%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm">Transferencia</span>
                  </div>
                  <span className="text-sm font-medium">$220 (10%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
