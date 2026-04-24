"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { createPurchaseAction } from "@/app/actions/purchases";

type Supplier = { id: string; name: string };
type Product = {
  id: string;
  costPrice: number;
  stock: number;
  phoneModel: { name: string };
  type: { name: string };
  color: { name: string; hexCode: string } | null;
};

type ProductType = { id: string; name: string };

type PurchaseItemRow = {
  id: string;
  productTypeId: string;
  quantityOrdered: number;
  unitCost: number;
};

export default function NewPurchaseClient({
  suppliers,
  productTypes
}: {
  suppliers: Supplier[];
  productTypes: ProductType[];
  products: any[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [supplierId, setSupplierId] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [notes, setNotes] = useState("");
  
  const [items, setItems] = useState<PurchaseItemRow[]>([]);

  const addItem = () => {
    setItems([
      ...items,
      { id: Date.now().toString(), productTypeId: "", quantityOrdered: 1, unitCost: 0 }
    ]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof PurchaseItemRow, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        return updatedItem;
      }
      return item;
    }));
  };

  const totalAmount = items.reduce((sum, item) => sum + (item.quantityOrdered * item.unitCost), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId) {
      toast.error("Selecciona un proveedor");
      return;
    }
    if (items.length === 0 || items.some(i => !i.productTypeId || i.quantityOrdered <= 0)) {
      toast.error("Agrega tipos de productos válidos al pedido");
      return;
    }

    setLoading(true);
    const result = await createPurchaseAction({
      supplierId,
      invoiceNumber,
      notes,
      items: items.map(i => ({
        productTypeId: i.productTypeId,
        quantityOrdered: Number(i.quantityOrdered),
        unitCost: Number(i.unitCost)
      })),
      totalAmount
    });

    if (result.error) {
      toast.error(result.error);
      setLoading(false);
    } else {
      toast.success("Pedido registrado correctamente");
      router.push("/compras");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-3">
      {/* Columna Izquierda: Detalles del Pedido */}
      <div className="md:col-span-1 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Detalles del Pedido</CardTitle>
            <CardDescription>Información general de la compra</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Proveedor *</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                required
              >
                <option value="">Seleccione un proveedor...</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Factura / Tracking (Opcional)</label>
              <Input 
                placeholder="#TRACKING-123" 
                value={invoiceNumber}
                onChange={e => setInvoiceNumber(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Notas</label>
              <Textarea 
                placeholder="Llega aprox. en 15 días por barco..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Columna Derecha: Productos */}
      <div className="md:col-span-2 space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Productos Solicitados</CardTitle>
              <CardDescription>Añade los items que vienen en camino</CardDescription>
            </div>
            <Button type="button" onClick={addItem} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" /> Agregar Item
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No hay productos en este pedido</p>
                <Button type="button" variant="link" onClick={addItem}>Agregar uno ahora</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={item.id} className="flex gap-4 items-start p-4 border rounded-lg bg-muted/20">
                    <div className="flex-1 space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-medium">Tipo de Producto</label>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          value={item.productTypeId}
                          onChange={(e) => updateItem(item.id, "productTypeId", e.target.value)}
                          required
                        >
                          <option value="">Seleccione tipo...</option>
                          {productTypes.map(pt => (
                            <option key={pt.id} value={pt.id}>
                              {pt.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex gap-4">
                        <div className="space-y-2 flex-1">
                          <label className="text-xs font-medium">Cantidad Pedida</label>
                          <Input 
                            type="number" 
                            min="1" 
                            value={item.quantityOrdered}
                            onChange={(e) => updateItem(item.id, "quantityOrdered", Number(e.target.value))}
                            required
                          />
                        </div>
                        <div className="space-y-2 flex-1">
                          <label className="text-xs font-medium">Costo Unitario (Bs.)</label>
                          <Input 
                            type="number" 
                            min="0" 
                            step="0.01"
                            value={item.unitCost}
                            onChange={(e) => updateItem(item.id, "unitCost", Number(e.target.value))}
                            required
                          />
                        </div>
                        <div className="space-y-2 flex-1">
                          <label className="text-xs font-medium">Subtotal</label>
                          <div className="h-10 flex items-center px-3 font-semibold bg-background border rounded-md">
                            Bs. {(item.quantityOrdered * item.unitCost).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button type="button" variant="ghost" size="icon" className="text-red-500 mt-6" onClick={() => removeItem(item.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between border-t p-6 bg-muted/10">
            <div className="text-lg font-medium">
              Total del Pedido: <span className="text-2xl font-bold ml-2">Bs. {totalAmount.toFixed(2)}</span>
            </div>
            <Button type="submit" size="lg" disabled={loading || items.length === 0}>
              {loading ? "Guardando..." : "Registrar Pedido"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </form>
  );
}
