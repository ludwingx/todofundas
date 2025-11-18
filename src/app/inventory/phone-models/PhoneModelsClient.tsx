"use client";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Trash2, Save, X, Undo, Search } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateModelDialog } from "./CreateModelDialog";

type PhoneModel = { id: string; name: string; status: string };

interface PhoneModelsClientProps {
  showDeleted: boolean;
  onModelCreated: () => void;
}

export default function PhoneModelsClient({ showDeleted, onModelCreated }: PhoneModelsClientProps) {
  const [models, setModels] = useState<PhoneModel[]>([]);
  const [deletedCount, setDeletedCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [pageSize, setPageSize] = useState<number>(20);
  const [page, setPage] = useState<number>(1);
  
  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return models.filter(model => 
      model.name.toLowerCase().includes(q) && 
      (showDeleted ? model.status === 'deleted' : model.status !== 'deleted')
    );
  }, [models, searchTerm, showDeleted]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filtered.length / pageSize));
  }, [filtered.length, pageSize]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [ pageSize, models.length]);

  useEffect(() => {
    load();
  }, [showDeleted]);

  useEffect(() => {
    async function fetchDeletedCount() {
      try {
        const res = await fetch("/api/phone-models/count?status=deleted");
        const data = await res.json();
        if (typeof data.count === 'number') {
          setDeletedCount(data.count);
        }
      } catch (e) {
        console.error("Error loading deleted count:", e);
      }
    }
    fetchDeletedCount();
  }, [models]);

  async function load() {
    setLoading(true);
    try {
      const url = `/api/phone-models${showDeleted ? '?status=deleted' : ''}`;
      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();
      if (Array.isArray(data)) setModels(data);
      else toast.error("Error", { description: data.error || "No se pudo cargar modelos" });
    } catch (e) {
      toast.error("Error de red", { description: "No se pudo obtener la lista" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function fetchDeletedCount() {
    try {
      const res = await fetch("/api/phone-models/count?status=deleted");
      if (!res.ok) {
        const errorData = await res.json();
        console.error('Error en la respuesta del servidor:', errorData);
        return;
      }
      const data = await res.json();
      if (data && typeof data.count === 'number') {
        setDeletedCount(data.count);
      } else {
        console.error('Respuesta inesperada del servidor:', data);
      }
    } catch (e) {
      console.error("Error al cargar el contador de eliminados:", e);
      // Mostrar un mensaje al usuario
      toast.error("Error", {
        description: "No se pudo cargar el contador de modelos eliminados"
      });
    }
  }

  function startEdit(m: PhoneModel) {
    setEditingId(m.id);
    setEditName(m.name);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
  }

  async function saveEdit(id: string) {
    const name = editName.trim();
    if (!name) return;
    try {
      const res = await fetch("/api/phone-models", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Modelo actualizado");
        setModels((prev) => prev.map((m) => (m.id === id ? { ...m, name } : m)));
        cancelEdit();
      } else {
        toast.error("No se pudo actualizar", { description: data.error });
      }
    } catch (e) {
      toast.error("Error de red", { description: "Intenta nuevamente" });
    }
  }

  async function remove(id: string) {
    const params = new URLSearchParams({ id });
    try {
      const res = await fetch(`/api/phone-models?${params}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        toast.success("Modelo eliminado");
        setModels((prev) => prev.filter((m) => m.id !== id));
      } else {
        toast.error("No se pudo eliminar", { description: data.error });
      }
    } catch (e) {
      toast.error("Error de red", { description: "Intenta nuevamente" });
    }
  }

  async function restoreModel(id: string) {
    try {
      const res = await fetch(`/api/phone-models/${id}/restore`, {
        method: 'POST',
      });
      if (res.ok) {
        toast.success("Modelo restaurado");
        load();
        const countRes = await fetch("/api/phone-models/count?status=deleted");
        const data = await countRes.json();
        if (typeof data.count === 'number') {
          setDeletedCount(data.count);
        }
      } else {
        const error = await res.json();
        toast.error("Error", { description: error.error || "No se pudo restaurar el modelo" });
      }
    } catch (e) {
      toast.error("Error de red", { description: "No se pudo restaurar el modelo" });
    }
  }

  async function deleteModel(id: string) {
    const params = new URLSearchParams({ id });
    try {
      const res = await fetch(`/api/phone-models?${params}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        toast.success("Modelo eliminado");
        setModels((prev) => prev.filter((m) => m.id !== id));
      } else {
        toast.error("No se pudo eliminar", { description: data.error });
      }
    } catch (e) {
      toast.error("Error de red", { description: "Intenta nuevamente" });
    }
  }

  async function handleModelCreated(): Promise<void> {
    if (onModelCreated) onModelCreated();
    try {
      // Recargar la lista de modelos
      await load();
      
      // Si estamos viendo los eliminados, actualizar el contador
      if (showDeleted) {
        await fetchDeletedCount();
      }
      
      // Mostrar mensaje de éxito
      toast.success("Modelo creado exitosamente");
    } catch (error) {
      console.error("Error al actualizar después de crear modelo:", error);
      toast.error("Error", {
        description: "Se creó el modelo pero hubo un error al actualizar la lista"
      });
    }
  }

  return (
    <div className="space-y-6">
       {/* Table Card */}
      <Card>
        <CardHeader className="pb-4">
  <div className="space-y-1">
    <CardTitle>Lista de Modelos</CardTitle>
    <CardDescription>
      {filtered.length} {filtered.length === 1 ? 'modelo' : 'modelos'} encontrados
    </CardDescription>
  </div>
</CardHeader>
{/* Buscador dentro de la Card, arriba de la tabla */}
<div className="px-6 pt-4">
  <div className="flex w-full">
    <div className="flex-1 w-full sm:w-auto">
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar modelos..."
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
                  <TableHead className="font-semibold w-20 pl-6">#</TableHead>
                  <TableHead className="font-semibold">Nombre del Modelo</TableHead>
                  <TableHead className="font-semibold text-right w-48 pr-6">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center py-8 text-muted-foreground">
                      {loading ? "Cargando modelos..." : "No se encontraron modelos."}
                    </TableCell>
                  </TableRow>
                ) : (
                  pageItems.map((model, index) => {
                    const rowNumber = (page - 1) * pageSize + index + 1;
                    return (
                    <TableRow key={model.id} className="group hover:bg-muted/50">
                      <TableCell className="py-4 text-muted-foreground pl-6">
                        {rowNumber}
                      </TableCell>
                      <TableCell className="py-4">
                        {editingId === model.id ? (
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(model.id); }}
                            className="w-full"
                            autoFocus
                          />
                        ) : (
                          <div className="flex items-center gap-3">
                            <span className="font-medium">{model.name}</span>
                            {model.status === 'deleted' && (
                              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                                Eliminado
                              </span>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="py-4 pr-6">
                        <div className="flex justify-end gap-2">
                          {editingId === model.id ? (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => saveEdit(model.id)}
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
                          ) : model.status === 'deleted' ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => restoreModel(model.id)}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                              <Undo className="h-4 w-4 mr-1" />
                              Restaurar
                            </Button>
                          ) : (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => startEdit(model)}
                                className="h-9 w-9 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteModel(model.id)}
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
                  return <span>Mostrando {start}–{end} de {filtered.length} modelos</span>;
                })()
              ) : (
                <span>Sin resultados</span>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Mostrar</span>
                <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
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