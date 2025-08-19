import { redirect } from 'next/navigation'
import { getSession } from '@/app/actions/auth'
import { prisma } from '@/lib/prisma'
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
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import NewProductClient from "./NewProductClient";
import ProductEditDialog from "./ProductEditDialog";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { Plus, Search, Filter, Edit, Package, Image as ImageIcon, Trash2 } from "lucide-react"
import { DeleteModal } from "@/components/ui/delete-modal"
import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Badge,
} from "@/components/ui/badge"

export default async function ProductsPage() {
  const session = await getSession()
  
  if (!session) {
    redirect('/login')
  }
  
  const userData = {
    name: session.name as string,
    email: session.username as string,
    avatar: "/avatars/default.jpg",
  }

  // Obtener productos reales de la base de datos
  const products = await prisma.product.findMany({
    where: { status: 'active' },
    include: {
      supplier: { select: { name: true } },
      type: { select: { name: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Obtener tipos, proveedores y modelos
  const productTypes = await prisma.productType.findMany({ select: { id: true, name: true } });
  const suppliers = await prisma.supplier.findMany({ select: { id: true, name: true } });
  const phoneModels = await prisma.phoneModel.findMany({ select: { id: true, name: true } });

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
                  <BreadcrumbPage>Productos</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Productos</h1>
              <p className="text-muted-foreground">
                Gestiona tu catálogo de fundas y protectores
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/inventory/products/deleted">
                <Button variant="outline" className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Eliminados</span>
                </Button>
              </Link>
              <Dialog>
              <DialogTrigger asChild>
                <button className="px-4 py-2 rounded bg-primary text-primary-foreground font-semibold shadow hover:bg-primary/90 transition text-sm">
                  + Nuevo Producto
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl p-4">
                <DialogHeader className="pb-2">
                  <DialogTitle className="text-lg font-semibold">Nuevo Producto</DialogTitle>
                </DialogHeader>
                <NewProductClient
                  productTypes={productTypes}
                  suppliers={suppliers}
                  phoneModels={phoneModels}
                />
              </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar productos..."
                className="pl-8"
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filtros
            </Button>
          </div>

          {/* Products Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[64px] hidden sm:table-cell">Imagen</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Proveedor</TableHead>
                  <TableHead className="text-right whitespace-nowrap min-w-[140px] shrink-0">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length > 0 ? (
                  products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="hidden sm:table-cell">
                        <div className="relative flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                          {product.imageUrl ? (
                            <Image 
                              src={product.imageUrl} 
                              alt={product.name} 
                              fill
                              className="rounded-md object-cover"
                            />
                          ) : (
                            <ImageIcon className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-xs text-muted-foreground">{product.color}</div>
                      </TableCell>
                      <TableCell>{product.type?.name || 'N/A'}</TableCell>
                      <TableCell>
                        <span className={`font-semibold ${
                          product.stock === 0 ? 'text-red-600' : 
                          product.stock <= 5 ? 'text-orange-600' : 
                          'text-green-600'
                        }`}>
                          {product.stock}
                        </span>
                      </TableCell>
                      <TableCell>
                        {product.stock === 0 ? (
                          <Badge variant="destructive">Sin Stock</Badge>
                        ) : product.stock <= 5 ? (
                          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                            Bajo Stock
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            En Stock
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        Bs. {typeof product.priceRetail === 'number' ? product.priceRetail.toFixed(2) : '0.00'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {product.supplier?.name || 'N/A'}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap min-w-[140px] shrink-0">
                        <div className="flex items-center justify-end gap-2 shrink-0">
                          <ProductEditDialog
                            product={product}
                            productTypes={productTypes}
                            suppliers={suppliers}
                            phoneModels={phoneModels}
                          />
                          <DeleteModal
                            title="Eliminar producto"
                            message={`¿Eliminar "${product.name}"?`}
                            deleteUrl={`/api/products/${product.id}`}
                            successText={`Producto "${product.name}" eliminado`}
                            trigger={
                              <Button variant="ghost" size="icon" className="group" title="Eliminar">
                                <Trash2 className="h-4 w-4 text-slate-600 group-hover:text-red-600 transition-colors" />
                              </Button>
                            }
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">
                      No hay productos registrados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Summary Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
              <div className="text-2xl font-bold text-green-600">{products.filter(p => p.stock > 5).length}</div>
              <p className="text-xs text-muted-foreground">Productos en stock</p>
            </div>
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
              <div className="text-2xl font-bold text-orange-600">{products.filter(p => p.stock > 0 && p.stock <= 5).length}</div>
              <p className="text-xs text-muted-foreground">Bajo stock</p>
            </div>
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
              <div className="text-2xl font-bold text-red-600">{products.filter(p => p.stock === 0).length}</div>
              <p className="text-xs text-muted-foreground">Sin stock</p>
            </div>
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
              <div className="text-2xl font-bold">{products.length}</div>
              <p className="text-xs text-muted-foreground">Total productos</p>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
