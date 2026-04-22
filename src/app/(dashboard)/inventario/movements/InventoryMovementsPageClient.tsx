"use client";
import { useState, useEffect, useRef } from "react";
import { ProductCombobox } from "./ProductCombobox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Trash2, Save, X, Search, Plus } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";


interface Movement {
  id: string;
  productId: string;
  type: string;
  quantity: number;
  reason: string;
  notes: string | null;
  createdAt: string;
  product?: { id: string; phoneModelId: string; color: string };
}

export default function InventoryMovementsPageClient() {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    productId: "",
    type: "",
    quantity: 1,
    reason: "",
    notes: ""
  });
  const requestInProgress = useRef(false);

  useEffect(() => {
    fetch("/api/products")
      .then(res => res.json())
      .then(data => setProducts(data));
  }, []);

  const fetchMovements = async () => {
    setLoading(true);
    const res = await fetch("/api/inventory-movements");
    let data = [];
    try {
      data = await res.json();
      if (!Array.isArray(data)) data = [];
    } catch {
      data = [];
    }
    setMovements(data);
    setLoading(false);
  };


  useEffect(() => { fetchMovements(); }, []);

  const filtered = movements.filter(m =>
    m.reason.toLowerCase().includes(searchTerm.trim().toLowerCase()) ||
    m.type.toLowerCase().includes(searchTerm.trim().toLowerCase()) ||
    m.productId.toLowerCase().includes(searchTerm.trim().toLowerCase())
  );

  const handleDelete = async (id: string) => {
    await fetch(`/api/inventory-movements/${id}`, { method: "DELETE" });
    fetchMovements();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (requestInProgress.current) return;
    requestInProgress.current = true;
    setLoading(true);
    try {
      const res = await fetch("/api/inventory-movements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error("Error", { description: data.error || "No se pudo crear el movimiento" });
      } else {
        toast.success("Movimiento registrado");
        setDialogOpen(false);
        setForm({ productId: "", type: "", quantity: 1, reason: "", notes: "" });
        fetchMovements();
      }
    } catch {
      toast.error("Error de red", { description: "No se pudo crear el movimiento" });
    } finally {
      setLoading(false);
      setTimeout(() => { requestInProgress.current = false; }, 500);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex w-full justify-end">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button type="button" variant="default" className="mb-2">
              <Plus className="h-4 w-4 mr-2" /> Nuevo Ajuste Manual
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleCreate} className="space-y-4">
              <DialogHeader>
                <DialogTitle>Registrar Ajuste Manual</DialogTitle>
                <DialogDescription>
                  Ingresa los datos para el movimiento de ajuste, corrección o devolución.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <label htmlFor="productId" className="text-sm font-medium leading-none">Producto</label>
                <ProductCombobox
                  products={products}
                  value={form.productId}
                  onChange={val => setForm(f => ({ ...f, productId: val }))}
                />
                <label htmlFor="type" className="text-sm font-medium leading-none">Tipo</label>
                <Select
                  value={form.type}
                  onValueChange={(val) => setForm((f) => ({ ...f, type: val }))}
                >
                  <SelectTrigger id="type" className="w-full bg-background text-foreground">
                    <SelectValue placeholder="Selecciona un tipo de movimiento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ajuste">Ajuste</SelectItem>
                    <SelectItem value="entrada">Entrada</SelectItem>
                    <SelectItem value="salida">Salida</SelectItem>
                    <SelectItem value="devolucion">Devolución</SelectItem>
                  </SelectContent>
                </Select>
                <label htmlFor="quantity" className="text-sm font-medium leading-none">Cantidad</label>
                <Input id="quantity" name="quantity" type="number" min={1} value={form.quantity} onChange={handleChange} required />
                <label htmlFor="reason" className="text-sm font-medium leading-none">Motivo</label>
                <Input
                  id="reason"
                  name="reason"
                  value={form.reason}
                  onChange={handleChange}
                  required
                  placeholder="Ej: corrección de stock, pérdida, daño, inventario, devolución, etc."
                />
                <label htmlFor="notes" className="text-sm font-medium leading-none">Notas</label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Notas adicionales (opcional): detalles, número de factura, explicación más larga..."
                  className="min-h-[80px]"
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={loading}>Cancelar</Button>
                <Button type="submit" disabled={loading}>{loading ? "Registrando..." : "Registrar"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader className="pb-4">
          <div className="space-y-1">
            <CardTitle>Lista de Movimientos</CardTitle>
            <CardDescription>
              {filtered.length} {filtered.length === 1 ? 'movimiento' : 'movimientos'} encontrados
            </CardDescription>
          </div>
        </CardHeader>
        <div className="px-6 pt-4">
          <div className="flex w-full">
            <div className="flex-1 w-full sm:w-auto">
              <div className="relative max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar movimientos..."
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
                  <TableHead className="font-semibold">Tipo</TableHead>
                  <TableHead className="font-semibold">Cantidad</TableHead>
                  <TableHead className="font-semibold">Motivo</TableHead>
                  <TableHead className="font-semibold">Producto</TableHead>
                  <TableHead className="font-semibold">Fecha</TableHead>
                  <TableHead className="font-semibold text-right w-48 pr-6">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {loading ? "Cargando movimientos..." : "No se encontraron movimientos."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((m, idx) => (
                    <TableRow key={m.id} className="group hover:bg-muted/50">
                      <TableCell className="py-4 text-muted-foreground pl-6">{idx + 1}</TableCell>
                      <TableCell className="py-4">{m.type}</TableCell>
                      <TableCell className="py-4">{m.quantity}</TableCell>
                      <TableCell className="py-4">{m.reason}</TableCell>
                      <TableCell className="py-4">{m.productId}</TableCell>
                      <TableCell className="py-4">{m.createdAt.slice(0,10)}</TableCell>
                      <TableCell className="py-4 pr-6">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(m.id)}
                            className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
