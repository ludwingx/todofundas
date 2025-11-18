import { redirect } from 'next/navigation'
import { getSession } from '@/app/actions/auth'
import { prisma } from '@/lib/prisma'
import { getColorName } from '@/lib/color-utils'
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
  // First get all active products with their relations
  const productsData = await prisma.product.findMany({
    where: { status: 'active' },
    include: {
      supplier: { 
        select: { id: true, name: true, status: true },
      },
      type: { 
        select: { id: true, name: true } 
      },
      phoneModel: { 
        select: { id: true, name: true, status: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Process the products to handle deleted phone models and create display names
  const products = productsData.map(product => ({
    ...product,
    // If phoneModel is deleted, set it to null
    phoneModel: product.phoneModel?.status === 'active' ? product.phoneModel : null,
    // Create a display name using type and phone model
    displayName: `${product.type?.name || 'Sin Tipo'} ${product.phoneModel?.name || 'Sin Modelo'}`.trim()
  }));

  // Obtener tipos, proveedores, modelos y colores
  const [productTypes, suppliers, phoneModels, colors] = await Promise.all([
    prisma.productType.findMany({ select: { id: true, name: true } }),
    prisma.supplier.findMany({ select: { id: true, name: true } }),
    prisma.phoneModel.findMany({ select: { id: true, name: true } }),
    prisma.color.findMany({ 
      where: { status: 'active' },
      select: { id: true, name: true, hexCode: true } 
    })
  ]);

  // Función para obtener el nombre del color
  const getColorDisplayName = (hex: string | null | undefined): string => {
    if (!hex) return 'Sin color';
    
    // Buscar en los colores de la base de datos
    const dbColor = colors.find(c => c.hexCode.toLowerCase() === hex.toLowerCase());
    if (dbColor) return dbColor.name;
    
    // Si no se encuentra, usar la función getColorName original
    return getColorName(hex);
  };

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
                <Button className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Eliminados</span>
                </Button>
              </Link>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Registrar Producto</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl p-4">
                  <DialogHeader className="pb-2">
                    <DialogTitle className="text-lg font-semibold">Registrar Producto</DialogTitle>
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
              <Input
                placeholder="Buscar productos..."
                className="pl-8"
              />
            </div>
            <Button>
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
                  <TableHead>Stock</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Proveedor</TableHead>
                  <TableHead >Acciones</TableHead>
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
                              alt={product.displayName} 
                              fill
                              className="rounded-md object-cover"
                            />
                          ) : (
                            <ImageIcon className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {product.displayName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {product.type?.name || 'Sin Tipo'}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className="inline-block w-5 h-5 rounded-full border border-muted shadow"
                            style={{ backgroundColor: product.color }}
                            title={getColorDisplayName(product.color)}
                          />
                          <span className="text-xs text-muted-foreground">
                            {getColorDisplayName(product.color)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`font-semibold ${
                          product.stock === 0 ? 'text-red-600' : 
                          (product.minStock !== null && product.stock <= product.minStock) ? 'text-orange-600' : 
                          'text-green-600'
                        }`}>
                          {product.stock}
                          {product.minStock !== null && (
                            <span className="text-xs text-muted-foreground block">
                              Mín: {product.minStock}
                            </span>
                          )}
                        </span>
                      </TableCell>
                      <TableCell>
                        {product.stock === 0 ? (
                          <Badge variant="destructive">Sin Stock</Badge>
                        ) : (product.minStock !== null && product.stock <= product.minStock) ? (
                          <Badge
                            variant="secondary"
                            className="bg-red-300 text-red-800 dark:bg-red-900 dark:text-red-100"
                          >
                            Bajo Stock
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="bg-green-300 text-green-800 dark:bg-green-900 dark:text-green-100"
                          >
                            En Stock
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        Bs. {typeof product.priceRetail === 'number' ? product.priceRetail.toFixed(2) : '0.00'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                    {!product.supplier || product.supplier.status === 'deleted' ? 'Sin Proveedor' : product.supplier.name || 'Sin Proveedor'}
                  </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2 shrink-0">
                          <ProductEditDialog
                            product={product}
                            productTypes={productTypes}
                            suppliers={suppliers}
                            phoneModels={phoneModels}
                            trigger={
                              <Button variant="ghost" size="icon" className="group" title="Editar">
                                <Edit className="h-4 w-4 text-slate-600 group-hover:text-blue-600 transition-colors" />
                              </Button>
                            }
                          />
                          <DeleteModal
                            title="Eliminar producto"
                            message={`¿Eliminar "${product.displayName}"?`}
                            deleteUrl={`/api/products/${product.id}`}
                            successText={`Producto "${product.displayName}" eliminado`}
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
              <div className="text-2xl font-bold text-green-600">
                {products.reduce((sum, product) => sum + (product.stock > 5 ? product.stock : 0), 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Unidades en stock</p>
            </div>
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
              <div className="text-2xl font-bold text-orange-600">
                {products.reduce((sum, product) => sum + (product.stock > 0 && product.stock <= 5 ? product.stock : 0), 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Unidades en bajo stock</p>
            </div>
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
              <div className="text-2xl font-bold text-red-600">
                {products.filter(p => p.stock === 0).length}
              </div>
              <p className="text-xs text-muted-foreground">Productos sin stock</p>
            </div>
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
              <div className="text-2xl font-bold">
                {products.reduce((sum, product) => sum + product.stock, 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Total unidades en inventario</p>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
