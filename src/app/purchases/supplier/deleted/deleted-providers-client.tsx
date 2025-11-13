'use client'

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, RotateCcw } from "lucide-react"
import { RestoreProviderButton } from "@/components/providers/restore-provider-button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface DeletedProvidersClientProps {
  providers: Array<{
    id: string
    name: string
    contact: string | null
    email: string | null
    phone: string | null
    address: string | null
  }>
  onRestore: (id: string) => Promise<void>
}

export function DeletedProvidersClient({ providers, onRestore }: DeletedProvidersClientProps) {
  const router = useRouter()

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Proveedores eliminados
          </h1>
          <p className="text-muted-foreground">
            Restaurar proveedores eliminados
          </p>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[20%]">Proveedor</TableHead>
              <TableHead className="w-[15%]">Contacto</TableHead>
              <TableHead className="w-[20%]">Email</TableHead>
              <TableHead className="w-[15%]">Teléfono</TableHead>
              <TableHead className="w-[20%]">Dirección</TableHead>
              <TableHead className="w-[10%] text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {providers.length ? (
              providers.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{p.contact || "-"}</TableCell>
                  <TableCell className="truncate max-w-[200px]">
                    {p.email || "-"}
                  </TableCell>
                  <TableCell>{p.phone || "-"}</TableCell>
                  <TableCell className="truncate max-w-[250px]">
                    {p.address || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <RestoreProviderButton
                        id={p.id}
                        name={p.name}
                        onRestore={onRestore}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <>
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No hay proveedores eliminados.
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={6} className="h-9 text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-gray-500 text-white hover:bg-gray-600 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Volver a proveedores"
                      onClick={() => router.push("/inventory/providers")}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Volver a proveedores
                    </Button>
                  </TableCell>
                </TableRow>
              </>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
