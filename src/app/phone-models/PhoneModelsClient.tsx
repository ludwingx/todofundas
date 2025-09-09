"use client";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Trash2, Save, X, Plus, Undo } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type PhoneModel = { id: string; name: string; status: string };

export default function PhoneModelsClient() {
  const [models, setModels] = useState<PhoneModel[]>([]);
  const [deletedCount, setDeletedCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [pageSize, setPageSize] = useState<number>(20);
  const [page, setPage] = useState<number>(1);
  const filtered = useMemo(() => {
    const q = newName.trim().toLowerCase();
    // Filter by search term and status
    return models.filter(model => 
      model.name.toLowerCase().includes(q) && 
      (showDeleted ? model.status === 'deleted' : model.status !== 'deleted')
    );
  }, [models, newName, showDeleted]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filtered.length / pageSize));
  }, [filtered.length, pageSize]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  useEffect(() => {
    // Reset to first page when filters/data/size change
    setPage(1);
  }, [newName, pageSize, models.length]);

  // Load data when showDeleted changes
  useEffect(() => {
    load();
  }, [showDeleted]);

  // Load deleted count
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

  async function createModel() {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/phone-models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Modelo creado");
        setNewName("");
        setModels((prev) => {
          const exists = prev.some((m) => m.id === data.id);
          return exists ? prev : [data, ...prev];
        });
      } else {
        toast.error("No se pudo crear", { description: data.error });
      }
    } catch (e) {
      toast.error("Error de red", { description: "Intenta nuevamente" });
    }
    setCreating(false);
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
        // Refresh deleted count
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

  return (
    <div className="space-y-4 max-w-4xl w-full mx-auto">
      <div className="flex gap-2 items-center">
        <Input
          placeholder="Buscar o escribir para agregar (p. ej., iPhone 14, Galaxy S24)"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') createModel(); }}
          className="max-w-md"
        />
        <Button className="ml-2" onClick={createModel} disabled={creating || !newName.trim()}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar
        </Button>
        <Button 
          variant={showDeleted ? "default" : "outline"} 
          onClick={() => setShowDeleted(!showDeleted)}
          className="flex items-center"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {showDeleted ? 'Ver Activos' : `Ver Eliminados (${deletedCount})`}
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead className="w-40 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center py-8 text-muted-foreground">
                  {loading ? "Cargando..." : "No hay resultados."}
                </TableCell>
              </TableRow>
            ) : (
              pageItems.map((model) => (
                <TableRow key={model.id}>
                  <TableCell>
                    {editingId === model.id ? (
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(model.id); }}
                        className="max-w-md"
                        autoFocus
                      />)
                    : (
                      <span className="font-medium">{model.name}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {editingId === model.id ? (
                      <div className="flex justify-end gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => saveEdit(model.id)}
                          className="group"
                          title="Guardar"
                        >
                          <Save className="h-4 w-4 text-slate-600 group-hover:text-green-600 transition-colors" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={cancelEdit}
                          className="group"
                          title="Cancelar"
                        >
                          <X className="h-4 w-4 text-slate-600 group-hover:text-slate-800 transition-colors" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-2">
                        {model.status === 'deleted' ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => restoreModel(model.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Undo className="h-4 w-4 mr-1" />
                            Restaurar
                          </Button>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingId(model.id);
                                setEditName(model.name);
                              }}
                              className="h-8 w-8 p-0"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteModel(model.id)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-muted-foreground">
          {filtered.length > 0 ? (
            (() => {
              const start = (page - 1) * pageSize + 1;
              const end = Math.min(page * pageSize, filtered.length);
              return <span>Mostrando {start}–{end} de {filtered.length}</span>;
            })()
          ) : (
            <span>Sin resultados</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Por página</span>
            <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
              <SelectTrigger className="h-8 w-[90px]">
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
            <span className="text-sm text-muted-foreground">
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
  );
}
