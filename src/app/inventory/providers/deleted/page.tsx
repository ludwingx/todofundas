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
import { DeleteModal } from "@/components/ui/delete-modal"
import { RotateCcw, Trash2 } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default async function ProvidersDeletedPage() {
  const session = await getSession()
  if (!session) {
    redirect('/login')
  }

  const userData = {
    name: session.name as string,
    email: session.username as string,
    avatar: "/avatars/default.jpg",
  }

  const providers = await prisma.supplier.findMany({ where: { status: 'deleted' }, orderBy: { createdAt: 'desc' } })

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
                  <BreadcrumbLink href="/inventory/providers">Proveedores</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Eliminados</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Proveedores eliminados</h1>
              <p className="text-muted-foreground">Restaurar proveedores eliminados</p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/inventory/providers">
                <Button variant="outline" className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4" />
                  <span className="hidden sm:inline">Volver a Activos</span>
                </Button>
              </Link>
            </div>
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
                        <DeleteModal
                          title="Restaurar proveedor"
                          message={`¿Restaurar "${p.name}"?`}
                          confirmText="Restaurar"
                          successText={`Proveedor "${p.name}" restaurado`}
                          errorText="No se pudo restaurar."
                          deleteUrl={`/api/providers/${p.id}`}
                          method="PATCH"
                          payload={{ status: 'active' }}
                          trigger={
                            <Button variant="ghost" size="icon" title="Restaurar">
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          }
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">No hay proveedores eliminados.</TableCell>
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
