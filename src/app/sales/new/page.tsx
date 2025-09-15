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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ArrowLeft, Search, Plus, Minus, ShoppingCart, Trash2 } from "lucide-react"
import Link from "next/link"

export default async function NewSalePage() {
  const session = await getSession()
  
  if (!session) {
    redirect('/login')
  }
  
  const userData = {
    name: session.name as string,
    email: session.username as string,
    avatar: "/avatars/default.jpg",
  }

  const availableProducts = [
    {
      id: "1",
      name: "Funda Transparente",
      model: "iPhone 14 Pro",
      color: "Transparente",
      stock: 25,
      priceRetail: 15.99,
      priceWholesale: 12.99,
    },
    {
      id: "2", 
      name: "Protector de Pantalla",
      model: "Samsung Galaxy S23",
      color: "Transparente",
      stock: 18,
      priceRetail: 12.99,
      priceWholesale: 9.99,
    },
    {
      id: "3",
      name: "Funda Silicona",
      model: "Xiaomi Redmi Note 12",
      color: "Negro",
      stock: 12,
      priceRetail: 8.99,
      priceWholesale: 6.99,
    }
  ]

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
                  <BreadcrumbLink href="/sales">
                    Punto de Venta
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Nueva Venta</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Nueva Venta</h1>
              <p className="text-muted-foreground">
                Registra una nueva venta de productos
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/sales">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver
              </Link>
            </Button>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Product Search and Selection */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Buscar Productos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por modelo de teléfono..."
                      className="pl-8"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    {availableProducts.map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{product.name}</h4>
                            <Badge variant="outline">{product.color}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{product.model}</p>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-sm">Stock: {product.stock}</span>
                            <span className="text-sm font-medium">${product.priceRetail}</span>
                          </div>
                        </div>
                        <Button size="sm">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sale Cart */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Carrito de Venta
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Cart Items Table */}
                  <div className="space-y-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Producto</TableHead>
                          <TableHead>Cant.</TableHead>
                          <TableHead>Precio</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>
                            <div>
                              <p className="font-medium">Funda Transparente</p>
                              <p className="text-sm text-muted-foreground">iPhone 14 Pro</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm">
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center">2</span>
                              <Button variant="outline" size="sm">
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>$15.99</TableCell>
                          <TableCell>$31.98</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <div>
                              <p className="font-medium">Protector Pantalla</p>
                              <p className="text-sm text-muted-foreground">iPhone 14 Pro</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm">
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center">1</span>
                              <Button variant="outline" size="sm">
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>$12.99</TableCell>
                          <TableCell>$12.99</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Información del Cliente</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerName">Nombre (Opcional)</Label>
                    <Input
                      id="customerName"
                      name="customerName"
                      placeholder="Nombre del cliente"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="customerPhone">Teléfono (Opcional)</Label>
                    <Input
                      id="customerPhone"
                      name="customerPhone"
                      placeholder="Número de teléfono"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Payment Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Información de Pago</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">Método de Pago</Label>
                    <Select name="paymentMethod" defaultValue="efectivo">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="efectivo">Efectivo</SelectItem>
                        <SelectItem value="tarjeta">Tarjeta</SelectItem>
                        <SelectItem value="transferencia">Transferencia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sale Summary */}
                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>$44.97</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Descuento:</span>
                      <span>$0.00</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span>$44.97</span>
                    </div>
                  </div>

                  <Button className="w-full" size="lg">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Procesar Venta
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
