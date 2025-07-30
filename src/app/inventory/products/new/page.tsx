import { redirect } from 'next/navigation'
import { getSession } from '@/app/actions/auth'
import { createProduct, getWarehouses, getProductTypes, getSuppliers } from '@/app/actions/products'
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
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import Link from "next/link"
import { ProductForm } from '@/components/product-form'
import prisma from '@/lib/prisma'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export default async function NewProductPage() {
  const session = await getSession()
  
  if (!session) {
    redirect('/login')
  }
  
  const userData = {
    name: session.name as string,
    email: session.username as string,
    avatar: "/avatars/default.jpg",
  }

  // Obtener datos para los selects
  const warehouses = await getWarehouses()
  const productTypes = await getProductTypes()
  const suppliers = await getSuppliers()

  // Obtener productos existentes
  const products = await prisma.product.findMany({
    include: {
      supplier: { select: { name: true } },
      type: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 30, // mostrar los 30 más recientes
  })

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
                  <BreadcrumbLink href="/inventory">
                    Inventario
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/inventory/products">
                    Productos
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Nuevo Producto</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        
        <main className="flex flex-1 flex-col p-4 md:p-10">
          <div className="w-full max-w-6xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold tracking-tight mb-2">Nuevo Producto</h2>
              <p className="text-muted-foreground mb-4">Agrega un nuevo producto al inventario</p>
              <Separator className="mb-6" />
            </div>
            <div className="w-full">
              {/* Botón para abrir modal y tabla de productos existentes */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
                <h3 className="text-lg font-semibold text-left">Productos existentes</h3>
                <Dialog >
                  <DialogTrigger asChild>
                    <button className="px-4 py-2 rounded bg-primary text-primary-foreground font-semibold shadow hover:bg-primary/90 transition text-sm">
                      + Nuevo Producto
                    </button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Nuevo Producto</DialogTitle>
                    </DialogHeader>
                    <ProductForm 
                      warehouses={warehouses}
                      productTypes={productTypes}
                      suppliers={suppliers}
                    />
                  </DialogContent>
                </Dialog>
              </div>
              <div className="mb-4">
                {/* Buscador simple por modelo/tipo/color */}
                <form action="#" method="GET" className="flex gap-2">
                  <input
                    type="text"
                    name="search"
                    placeholder="Buscar por modelo, tipo o color..."
                    className="w-full px-3 py-2 border rounded-md text-sm"
                    // Para una búsqueda real, se debería implementar filtrado en el server o client
                  />
                  <button type="submit" className="px-4 py-2 rounded bg-muted text-foreground border border-input hover:bg-accent transition text-sm">Buscar</button>
                </form>
              </div>
              <div className="overflow-x-auto rounded-lg border bg-card text-card-foreground shadow-sm">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted">
                      <th className="p-2 text-left font-medium">Modelo</th>
                      <th className="p-2 text-left font-medium">Tipo</th>
                      <th className="p-2 text-left font-medium">Color</th>
                      <th className="p-2 text-left font-medium">Stock</th>
                      <th className="p-2 text-left font-medium">Precio Venta (Bs.)</th>
                      <th className="p-2 text-left font-medium">Proveedor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.length > 0 ? (
                      products.map((product: any) => (
                        <tr key={product.id} className="border-b last:border-b-0">
                          <td className="p-2">{product.model}</td>
                          <td className="p-2">{product.type?.name || '-'}</td>
                          <td className="p-2">{product.color}</td>
                          <td className="p-2 text-center">{product.stock}</td>
                          <td className="p-2">Bs. {Number(product.priceRetail).toFixed(2)}</td>
                          <td className="p-2">{product.supplier?.name || '-'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="p-4 text-center text-muted-foreground">No hay productos registrados.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
