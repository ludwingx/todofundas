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
import { Plus, ShoppingBag, TrendingUp, Package, Users } from "lucide-react"
import Link from "next/link"

export default async function PurchasesPage() {
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
                    TodoFundas
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Compras</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Compras</h1>
              <p className="text-muted-foreground">
                Gestiona las compras a proveedores y actualiza el inventario
              </p>
            </div>
            <Button asChild>
              <Link href="/purchases/new">
                <Plus className="mr-2 h-4 w-4" />
                Nueva Compra
              </Link>
            </Button>
          </div>

          {/* Purchase Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
              <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="tracking-tight text-sm font-medium">Compras del Mes</h3>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">$12,450</div>
              <p className="text-xs text-muted-foreground">+8% vs mes anterior</p>
            </div>
            
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
              <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="tracking-tight text-sm font-medium">Órdenes Pendientes</h3>
                <Package className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">7</div>
              <p className="text-xs text-muted-foreground">2 por recibir</p>
            </div>
            
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
              <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="tracking-tight text-sm font-medium">Proveedores Activos</h3>
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">+2 nuevos este mes</p>
            </div>
            
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
              <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="tracking-tight text-sm font-medium">Productos Recibidos</h3>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">1,247</div>
              <p className="text-xs text-muted-foreground">Este mes</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Button asChild className="h-20 flex-col gap-2">
              <Link href="/purchases/new">
                <Plus className="h-6 w-6" />
                <span>Nueva Compra</span>
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="h-20 flex-col gap-2">
              <Link href="/purchases/suppliers">
                <Users className="h-6 w-6" />
                <span>Gestionar Proveedores</span>
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="h-20 flex-col gap-2">
              <Link href="/purchases/history">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Historial Compras</span>
              </Link>
            </Button>
          </div>

          {/* Recent Purchases */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Compras Recientes</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-3 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <ShoppingBag className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Fundas iPhone 14 Pro - 100 unidades</p>
                    <p className="text-xs text-muted-foreground">Proveedor: TechCases Inc</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">$850.00</p>
                  <p className="text-xs text-muted-foreground">Hace 2 días</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <ShoppingBag className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Protectores Samsung S23 - 50 unidades</p>
                    <p className="text-xs text-muted-foreground">Proveedor: ScreenGuard Pro</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">$300.00</p>
                  <p className="text-xs text-muted-foreground">Hace 5 días</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <ShoppingBag className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Fundas Xiaomi Redmi - 75 unidades</p>
                    <p className="text-xs text-muted-foreground">Proveedor: CaseMaster</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">$337.50</p>
                  <p className="text-xs text-muted-foreground">Hace 1 semana</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <ShoppingBag className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Fundas Cuero iPhone 13 - 25 unidades</p>
                    <p className="text-xs text-muted-foreground">Proveedor: LeatherTech</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">$350.00</p>
                  <p className="text-xs text-muted-foreground">Hace 1 semana</p>
                </div>
              </div>
            </div>
          </div>

          {/* Top Suppliers and Purchase Analysis */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Principales Proveedores</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">TechCases Inc</span>
                  </div>
                  <span className="text-sm font-medium">$4,250</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">ScreenGuard Pro</span>
                  </div>
                  <span className="text-sm font-medium">$2,800</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-sm">CaseMaster</span>
                  </div>
                  <span className="text-sm font-medium">$2,100</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm">LeatherTech</span>
                  </div>
                  <span className="text-sm font-medium">$1,750</span>
                </div>
              </div>
            </div>
            
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Productos Más Comprados</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Fundas iPhone</span>
                  </div>
                  <span className="text-sm font-medium">450 unidades</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Protectores Samsung</span>
                  </div>
                  <span className="text-sm font-medium">320 unidades</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm">Fundas Xiaomi</span>
                  </div>
                  <span className="text-sm font-medium">280 unidades</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-sm">Accesorios</span>
                  </div>
                  <span className="text-sm font-medium">197 unidades</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
