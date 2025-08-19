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
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { DeleteModal } from "@/components/ui/delete-modal"
import { Package, Image as ImageIcon, RotateCcw, Trash2, Search, Filter } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default async function DeletedProductsPage() {
  const session = await getSession()
  if (!session) {
    redirect('/login')
  }

  const userData = {
    name: session.name as string,
    email: session.username as string,
    avatar: "/avatars/default.jpg",
  }

  const products = await prisma.product.findMany({
    where: { status: 'deleted' },
    include: { supplier: { select: { name: true } }, type: { select: { name: true } } },
    orderBy: { updatedAt: 'desc' }
  })

  return (
    <SidebarProvider>
      <AppSidebar user={userData} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">TodoFundas</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/inventory">Inventario</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Productos eliminados</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Productos eliminados</h1>
              <p className="text-muted-foreground">Lista de productos inactivos. Puedes restaurarlos cuando quieras.</p>
            </div>
            <Link href="/inventory/products">
              <Button variant="default" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                <span className="hidden sm:inline">Activos</span>
              </Button>
            </Link>
          </div>

          {/* Optional search same layout for consistency */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <input className="pl-8 h-9 w-full border rounded px-3 text-sm bg-background" placeholder="Buscar productos..." />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filtros
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[64px] hidden sm:table-cell">Imagen</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Proveedor</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length ? products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="hidden sm:table-cell">
                      <div className="relative flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                        {product.imageUrl ? (
                          <Image src={product.imageUrl} alt={product.name} fill className="rounded-md object-cover" />
                        ) : (
                          <ImageIcon className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-xs text-muted-foreground">{product.color}</div>
                    </TableCell>
                    <TableCell>{product.type?.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-zinc-200 text-zinc-800">Inactivo</Badge>
                    </TableCell>
                    <TableCell>Bs. {product.priceRetail.toFixed(2)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{product.supplier?.name || 'N/A'}</TableCell>
                    <TableCell className="text-right">
                      <DeleteModal
                        title="Restaurar producto"
                        message={`¿Restaurar "${product.name}"?`}
                        confirmText="Restaurar"
                        successText={`Producto "${product.name}" restaurado`}
                        errorText="No se pudo restaurar."
                        deleteUrl={`/api/products/${product.id}`}
                        method="PATCH"
                        payload={{ status: 'active' }}
                        trigger={
                          <Button variant="ghost" size="icon" className="group" title="Restaurar">
                            <RotateCcw className="h-4 w-4 text-slate-600 group-hover:text-green-600 transition-colors" />
                          </Button>
                        }
                      />
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">No hay productos eliminados.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
