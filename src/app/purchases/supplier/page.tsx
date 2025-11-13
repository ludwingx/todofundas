import { redirect } from 'next/navigation'
import Link from "next/link"
import { getSession } from '@/app/actions/auth'
import { prisma } from '@/lib/prisma'

// Componentes de UI
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
import { DeleteModal } from "@/components/ui/delete-modal"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// Iconos
import { Users, Edit, Trash2, Plus, Search, Filter } from "lucide-react"

// Componentes de cliente
import NewProviderClient from "./NewProviderClient"
import EditProviderClient from "./EditProviderClient"

export default async function ProvidersPage() {
  const session = await getSession()
  if (!session) {
    redirect('/login')
  }

  const userData = {
    name: session.name as string,
    email: session.username as string,
    avatar: "/avatars/default.jpg",
  }

  const providers = await prisma.supplier.findMany({ where: { status: 'active' }, orderBy: { createdAt: 'desc' } })

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
                  <BreadcrumbLink href="/dashboard">FundaMania</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/inventory">Inventario</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Proveedores</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Proveedores</h1>
              <p className="text-muted-foreground">Gestiona tus proveedores</p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/inventory/providers/deleted">
                <Button variant="outline" className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Eliminados</span>
                </Button>
              </Link>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline"  className="px-4 py-2 rounded bg-primary text-primary-foreground font-semibold shadow hover:bg-primary/90 hover:text-white transition text-sm ">
                    <Plus className="mr-2 h-4 w-4 inline" /> Nuevo Proveedor
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg p-4">
                  <DialogHeader className="pb-2">
                    <DialogTitle className="text-lg font-semibold">Nuevo Proveedor</DialogTitle>
                  </DialogHeader>
                  <NewProviderClient />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar proveedores..." className="pl-8" />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" /> Filtros
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Proveedor</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Dirección</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {providers.length ? providers.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{p.contact || '-'}</TableCell>
                    <TableCell>{p.email || '-'}</TableCell>
                    <TableCell>{p.phone || '-'}</TableCell>
                    <TableCell>{p.address || '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Edit dialog */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" title="Editar">
                              <Edit className="h-4 w-4"color="blue" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-lg p-4">
                            <DialogHeader className="pb-2">
                              <DialogTitle className="text-lg font-semibold">Editar Proveedor</DialogTitle>
                            </DialogHeader>
                            <EditProviderClient provider={p}  />
                          </DialogContent>
                        </Dialog>
                        {/* Delete */}
                        <DeleteModal
                          title="Eliminar proveedor"
                          message={`¿Eliminar "${p.name}"?`}
                          deleteUrl={`/api/providers/${p.id}`}
                          successText={`Proveedor "${p.name}" eliminado`}
                          trigger={
                            <Button variant="ghost" size="icon" title="Eliminar">
                              <Trash2 className="h-4 w-4 " color="red" />
                            </Button>
                          }
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">No hay proveedores.</TableCell>
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