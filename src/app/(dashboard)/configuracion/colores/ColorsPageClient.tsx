"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, Palette, Loader2, Search } from "lucide-react";
import { ColorPickerModal } from "@/components/color-picker-modal";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogHeader,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";

interface Color {
  id: string;
  name: string;
  hexCode: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function ColorsPageClient() {
  const [colors, setColors] = useState<Color[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingColor, setEditingColor] = useState<Color | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [colorToDelete, setColorToDelete] = useState<Color | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState<number>(20);
  const [page, setPage] = useState<number>(1);

  const fetchColors = async () => {
    try {
      const response = await fetch("/api/colors");
      if (!response.ok) throw new Error("Error al cargar colores");
      const data = await response.json();
      setColors(data);
    } catch (error) {
      toast.error("No se pudieron cargar los colores");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchColors();
  }, []);

  const handleSaveColor = async (colorData: { name: string; hexCode: string }) => {
    try {
      const url = editingColor ? `/api/colors/${editingColor.id}` : "/api/colors";
      const method = editingColor ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(colorData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al guardar el color");
      }

      toast.success(
        editingColor ? "Color actualizado correctamente" : "Color creado correctamente"
      );

      fetchColors();
      setModalOpen(false);
      setEditingColor(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al guardar el color"
      );
      throw error;
    }
  };

  const handleEditColor = (color: Color) => {
    setEditingColor(color);
    setModalOpen(true);
  };

  const handleDeleteClick = (color: Color) => {
    setColorToDelete(color);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!colorToDelete) return;

    try {
      const response = await fetch(`/api/colors/${colorToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Error al eliminar el color");

      toast.success("Color eliminado correctamente");

      fetchColors();
    } catch (error) {
      toast.error("No se pudo eliminar el color");
    } finally {
      setDeleteDialogOpen(false);
      setColorToDelete(null);
    }
  };

  const handleNewColor = () => {
    setEditingColor(null);
    setModalOpen(true);
  };

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return colors.filter((color) =>
      color.name.toLowerCase().includes(q)
    );
  }, [colors, searchTerm]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filtered.length / pageSize));
  }, [filtered.length, pageSize]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [pageSize, filtered.length]);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex w-full justify-end">
        <Button onClick={handleNewColor}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Color
        </Button>
      </div>
      <Card>
        <CardHeader className="pb-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              Lista de Colores
            </CardTitle>
            <CardDescription>
              {filtered.length} {filtered.length === 1 ? "color" : "colores"} encontrados
            </CardDescription>
          </div>
        </CardHeader>
        <div className="px-6 pt-4">
          <div className="flex w-full">
            <div className="flex-1 w-full sm:w-auto">
              <div className="relative max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar colores..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-full"
                />
              </div>
            </div>
          </div>
        </div>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Palette className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay colores registrados</p>
              <p className="text-sm">
                Haz clic en "Nuevo Color" para agregar uno
              </p>
            </div>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold w-20 pl-6">#</TableHead>
                    <TableHead className="w-[110px] font-semibold">Vista Previa</TableHead>
                    <TableHead className="font-semibold">Nombre</TableHead>
                    <TableHead className="font-semibold">Código Hex</TableHead>
                    <TableHead className="font-semibold text-right w-48 pr-6">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Sin resultados
                      </TableCell>
                    </TableRow>
                  ) : (
                    pageItems.map((color, index) => {
                      const rowNumber = (page - 1) * pageSize + index + 1;
                      return (
                        <TableRow key={color.id} className="group hover:bg-muted/50">
                          <TableCell className="py-4 text-muted-foreground pl-6">
                            {rowNumber}
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-10 h-10 rounded-md border-2 border-gray-300 shadow-sm"
                                style={{ backgroundColor: color.hexCode }}
                              />
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <span className="font-medium">{color.name}</span>
                          </TableCell>
                          <TableCell className="py-4">
                            <code className="px-2 py-1 rounded text-sm font-mono">
                              {color.hexCode}
                            </code>
                          </TableCell>
                          <TableCell className="py-4 pr-6">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditColor(color)}
                                className="h-9 w-9 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteClick(color)}
                                className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

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
    </div>
  );
}

