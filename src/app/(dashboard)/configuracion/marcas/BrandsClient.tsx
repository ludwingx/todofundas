"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2, Save, X, RotateCcw, Search } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Brand = { id: string; name: string; status?: string; logoUrl?: string | null };

interface BrandsClientProps {
  showDeleted: boolean;
  onBrandCreated: () => void;
  onDeletedCountChange?: (count: number) => void;
  reloadKey?: number;
}

export default function BrandsClient({
  showDeleted,
  onBrandCreated,
  onDeletedCountChange,
  reloadKey,
}: BrandsClientProps) {
  const [Brands, setBrands] = useState<Brand[]>([]);
  const [deletedCount, setDeletedCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editLogoUrl, setEditLogoUrl] = useState("");
  const [pageSize, setPageSize] = useState<number>(20);
  const [page, setPage] = useState<number>(1);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return Brands.filter((Brand) => {
      const matchesName = Brand.name.toLowerCase().includes(q);
      const isDeleted = Brand.status === "deleted";
      const matchesStatus = showDeleted ? isDeleted : !isDeleted;
      return matchesName && matchesStatus;
    });
  }, [Brands, searchTerm, showDeleted]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filtered.length / pageSize));
  }, [filtered.length, pageSize]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const url = `/api/brands?all=true`;
      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();
      if (Array.isArray(data)) setBrands(data);
      else
        toast.error("Error", {
          description: data.error || "No se pudo cargar Marcas",
        });
    } catch (e) {
      toast.error("Error de red", {
        description: "No se pudo obtener la lista",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    load();
  }, [showDeleted, reloadKey, load]);

  // Actualizar contador de eliminados
  useEffect(() => {
    const count = Brands.filter((m) => m.status === "deleted").length;
    setDeletedCount(count);
    if (onDeletedCountChange) onDeletedCountChange(count);
  }, [Brands, onDeletedCountChange]);

  useEffect(() => {
    load();
  }, [load]);

  function startEdit(Brand: Brand) {
    setEditingId(Brand.id);
    setEditName(Brand.name);
    setEditLogoUrl(Brand.logoUrl || "");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
    setEditLogoUrl("");
  }

  async function saveEdit(id: string) {
    const name = editName.trim();
    const logoUrl = editLogoUrl.trim() || null;
    if (!name) return;
    try {
      const res = await fetch(`/api/brands/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, logoUrl }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Marca actualizada");
        setBrands((prev) =>
          prev.map((m) => (m.id === id ? { ...m, name, logoUrl } : m))
        );
        cancelEdit();
      } else {
        toast.error("No se pudo actualizar", { description: data.error });
      }
    } catch (e) {
      toast.error("Error de red", { description: "Intenta nuevamente" });
    }
  }

  async function deleteBrand(id: string) {
    try {
      const res = await fetch(`/api/brands/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        toast.success("Marca eliminada");
        await load();
      } else {
        toast.error("No se pudo eliminar", { description: data.error });
      }
    } catch (e) {
      toast.error("Error de red", { description: "Intenta nuevamente" });
    }
  }

  async function restoreBrand(id: string) {
    try {
      const res = await fetch(`/api/brands/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "active" }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Marca restaurada");
        await load();
      } else {
        toast.error("No se pudo restaurar", { description: data.error });
      }
    } catch (e) {
      toast.error("Error de red", { description: "Intenta nuevamente" });
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <div className="space-y-1">
            <CardTitle>Lista de Marcas</CardTitle>
            <CardDescription>
              {filtered.length}{" "}
              {filtered.length === 1 ? "Marca" : "Marcas"} encontradas
            </CardDescription>
          </div>
        </CardHeader>
        <div className="px-6 pt-4">
          <div className="flex w-full">
            <div className="flex-1 w-full sm:w-auto">
              <div className="relative max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar Marcas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-full"
                />
              </div>
            </div>
          </div>
        </div>
        <CardContent className="p-0">
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold w-16 pl-6">#</TableHead>
                  <TableHead className="font-semibold w-24">Logo</TableHead>
                  <TableHead className="font-semibold">
                    Nombre de la Marca
                  </TableHead>
                  <TableHead className="font-semibold text-right w-48 pr-6">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageItems.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-8 text-muted-foreground"
                    >
                      {loading
                        ? "Cargando Marcas..."
                        : "No se encontraron Marcas."}
                    </TableCell>
                  </TableRow>
                ) : (
                  pageItems.map((Brand, index) => {
                    const rowNumber = (page - 1) * pageSize + index + 1;
                    const isDeleted = Brand.status === "deleted";
                    return (
                      <TableRow
                        key={Brand.id}
                        className="group hover:bg-muted/50"
                      >
                        <TableCell className="py-4 text-muted-foreground pl-6">
                          {rowNumber}
                        </TableCell>
                        <TableCell className="py-4">
                          {Brand.logoUrl ? (
                            <div className="h-10 w-10 relative rounded-md border bg-white overflow-hidden">
                              <img 
                                src={Brand.logoUrl} 
                                alt={Brand.name} 
                                className="h-full w-full object-contain"
                              />
                            </div>
                          ) : (
                            <div className="h-10 w-10 rounded-md border bg-muted flex items-center justify-center text-[10px] text-muted-foreground uppercase font-black">
                              {Brand.name.substring(0, 2)}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="py-4">
                          {editingId === Brand.id ? (
                            <div className="flex flex-col gap-2">
                              <Input
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="h-8"
                                placeholder="Nombre"
                                autoFocus
                              />
                              <Input
                                value={editLogoUrl}
                                onChange={(e) => setEditLogoUrl(e.target.value)}
                                className="h-8 text-xs"
                                placeholder="URL del Logo (opcional)"
                              />
                            </div>
                          ) : (
                            <span className="font-medium">{Brand.name}</span>
                          )}
                        </TableCell>
                        <TableCell className="py-4 pr-6">
                          <div className="flex justify-end gap-2">
                            {editingId === Brand.id ? (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => saveEdit(Brand.id)}
                                  className="h-9 w-9 text-green-600 hover:text-green-700 hover:bg-green-50"
                                >
                                  <Save className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={cancelEdit}
                                  className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            ) : isDeleted ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => restoreBrand(Brand.id)}
                                className="h-9 w-9 text-green-600 hover:text-green-700 hover:bg-green-50"
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            ) : (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => startEdit(Brand)}
                                  className="h-9 w-9 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteBrand(Brand.id)}
                                  className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            {filtered.length > 0 ? (
              (() => {
                const start = (page - 1) * pageSize + 1;
                const end = Math.min(page * pageSize, filtered.length);
                return (
                  <span>
                    Mostrando {start} - {end} de {filtered.length} Brandes
                  </span>
                );
              })()
            ) : (
              <span>Sin resultados</span>
            )}
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Mostrar</span>
              <Select
                value={String(pageSize)}
                onValueChange={(v) => setPageSize(Number(v))}
              >
                <SelectTrigger className="h-9 w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground min-w-24 text-center">
                Página {page} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                Siguiente
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
