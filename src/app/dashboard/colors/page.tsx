"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Pencil, Trash2, Palette, Loader2 } from "lucide-react"
import { ColorPickerModal } from "@/components/color-picker-modal"
import { toast } from "sonner"
import { AlertDialogHeader, AlertDialogFooter } from "@/components/ui/alert-dialog"
import { AlertDialog, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction } from "@radix-ui/react-alert-dialog"

interface Color {
  id: string
  name: string
  hexCode: string
  status: string
  createdAt: string
  updatedAt: string
}

export default function ColorsPage() {
  const [colors, setColors] = useState<Color[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingColor, setEditingColor] = useState<Color | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [colorToDelete, setColorToDelete] = useState<Color | null>(null)

  const fetchColors = async () => {
    try {
      const response = await fetch("/api/colors")
      if (!response.ok) throw new Error("Error al cargar colores")
      const data = await response.json()
      setColors(data)
    } catch (error) {
      toast.error("No se pudieron cargar los colores")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchColors()
  }, [])

  const handleSaveColor = async (colorData: {
    name: string
    hexCode: string
  }) => {
    try {
      const url = editingColor
        ? `/api/colors/${editingColor.id}`
        : "/api/colors"
      const method = editingColor ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(colorData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al guardar el color")
      }

      toast.success(
        editingColor
          ? "Color actualizado correctamente"
          : "Color creado correctamente"
      )

      fetchColors()
      setModalOpen(false)
      setEditingColor(null)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al guardar el color"
      )
      throw error
    }
  }

  const handleEditColor = (color: Color) => {
    setEditingColor(color)
    setModalOpen(true)
  }

  const handleDeleteClick = (color: Color) => {
    setColorToDelete(color)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!colorToDelete) return

    try {
      const response = await fetch(`/api/colors/${colorToDelete.id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Error al eliminar el color")

      toast.success("Color eliminado correctamente")

      fetchColors()
    } catch (error) {
      toast.error("No se pudo eliminar el color")
    } finally {
      setDeleteDialogOpen(false)
      setColorToDelete(null)
    }
  }

  const handleNewColor = () => {
    setEditingColor(null)
    setModalOpen(true)
  }

  return (
    <SidebarProvider>
      <AppSidebar
        user={{
          name: "Usuario",
          email: "usuario@ejemplo.com",
          avatar: "/avatars/default.jpg",
        }}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Colores</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Gestión de Colores
              </CardTitle>
              <Button onClick={handleNewColor}>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Color
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : colors.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Palette className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay colores registrados</p>
                  <p className="text-sm">
                    Haz clic en "Nuevo Color" para agregar uno
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Vista Previa</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Código Hex</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {colors.map((color) => (
                      <TableRow key={color.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-10 h-10 rounded-md border-2 border-gray-300 shadow-sm"
                              style={{ backgroundColor: color.hexCode }}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {color.name}
                        </TableCell>
                        <TableCell>
                          <code className="px-2 py-1  rounded text-sm font-mono">
                            {color.hexCode}
                          </code>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditColor(color)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(color)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>

      <ColorPickerModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSave={handleSaveColor}
        editColor={editingColor}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el color "{colorToDelete?.name}". Esta
              acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-500 hover:bg-red-600"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  )
}
