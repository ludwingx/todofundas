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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  ShoppingBag, 
  Package, 
  Users, 
  Plus, 
  TrendingUp, 
  Clock,
  ArrowUpRight,
  ChevronRight
} from "lucide-react"
import Link from "next/link"
import { NewPurchaseForm } from "./components/new-purchase-form"

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
                    FundaMania
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
        
        <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
          {/* Header Section */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Compras</h1>
              <p className="text-muted-foreground">
                Gestiona las compras a proveedores y actualiza el inventario
              </p>
            </div>
            <NewPurchaseForm />
          </div>

          {/* Purchase Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Compras del Mes</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$12,450</div>
                <div className="flex items-center pt-1">
                  <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                  <p className="text-xs text-muted-foreground">+8% vs mes anterior</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Órdenes Pendientes</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">7</div>
                <div className="flex items-center pt-1">
                  <Badge variant="outline" className="text-xs">2 por recibir</Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Proveedores Activos</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <div className="flex items-center pt-1">
                  <Plus className="h-3 w-3 text-green-600 mr-1" />
                  <p className="text-xs text-muted-foreground">+2 nuevos este mes</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Productos Recibidos</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,247</div>
                <p className="text-xs text-muted-foreground pt-1">Este mes</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <NewPurchaseForm>
              <Card className="group cursor-pointer transition-all hover:shadow-md">
                <CardContent className="p-6 flex flex-col items-center justify-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Plus className="h-6 w-6 text-primary" />
                  </div>
                  <span className="font-medium">Nueva Compra</span>
                </CardContent>
              </Card>
            </NewPurchaseForm>
            
            <Card className="group cursor-pointer transition-all hover:shadow-md">
              <Link href="/purchases/suppliers">
                <CardContent className="p-6 flex flex-col items-center justify-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <span className="font-medium">Gestionar Proveedores</span>
                </CardContent>
              </Link>
            </Card>
            
            <Card className="group cursor-pointer transition-all hover:shadow-md">
              <Link href="/purchases/history">
                <CardContent className="p-6 flex flex-col items-center justify-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <Clock className="h-6 w-6 text-green-600" />
                  </div>
                  <span className="font-medium">Historial Compras</span>
                </CardContent>
              </Link>
            </Card>
          </div>

          {/* Recent Purchases and Analytics */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent Purchases */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Compras Recientes</CardTitle>
                  <CardDescription>Últimas transacciones realizadas</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/purchases/history" className="text-xs">
                    Ver todo <ChevronRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="grid gap-4">
                {[
                  { 
                    product: "Fundas iPhone 14 Pro - 100 unidades", 
                    supplier: "TechCases Inc", 
                    amount: "$850.00", 
                    time: "Hace 2 días",
                    icon: <ShoppingBag className="h-5 w-5 text-green-600" />,
                    bg: "bg-green-100"
                  },
                  { 
                    product: "Protectores Samsung S23 - 50 unidades", 
                    supplier: "ScreenGuard Pro", 
                    amount: "$300.00", 
                    time: "Hace 5 días",
                    icon: <ShoppingBag className="h-5 w-5 text-blue-600" />,
                    bg: "bg-blue-100"
                  },
                  { 
                    product: "Fundas Xiaomi Redmi - 75 unidades", 
                    supplier: "CaseMaster", 
                    amount: "$337.50", 
                    time: "Hace 1 semana",
                    icon: <ShoppingBag className="h-5 w-5 text-purple-600" />,
                    bg: "bg-purple-100"
                  }
                ].map((purchase, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className={`${purchase.bg} rounded-full p-2`}>
                      {purchase.icon}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">{purchase.product}</p>
                      <p className="text-sm text-muted-foreground">{purchase.supplier}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{purchase.amount}</p>
                      <p className="text-xs text-muted-foreground">{purchase.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Top Suppliers and Products */}
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Principales Proveedores</CardTitle>
                  <CardDescription>Por volumen de compras</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { name: "TechCases Inc", amount: "$4,250", percentage: 38, color: "bg-blue-500" },
                    { name: "ScreenGuard Pro", amount: "$2,800", percentage: 25, color: "bg-green-500" },
                    { name: "CaseMaster", amount: "$2,100", percentage: 19, color: "bg-orange-500" },
                    { name: "LeatherTech", amount: "$1,750", percentage: 16, color: "bg-purple-500" }
                  ].map((supplier, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 ${supplier.color} rounded-full`}></div>
                          <span className="text-sm font-medium">{supplier.name}</span>
                        </div>
                        <span className="text-sm font-medium">{supplier.amount}</span>
                      </div>
                      <Progress value={supplier.percentage} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Productos Más Comprados</CardTitle>
                  <CardDescription>Este mes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { name: "Fundas iPhone", units: "450 unidades", percentage: 32, color: "bg-green-500" },
                    { name: "Protectores Samsung", units: "320 unidades", percentage: 23, color: "bg-blue-500" },
                    { name: "Fundas Xiaomi", units: "280 unidades", percentage: 20, color: "bg-purple-500" },
                    { name: "Accesorios", units: "197 unidades", percentage: 14, color: "bg-orange-500" }
                  ].map((product, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 ${product.color} rounded-full`}></div>
                        <span className="text-sm font-medium">{product.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{product.units}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}