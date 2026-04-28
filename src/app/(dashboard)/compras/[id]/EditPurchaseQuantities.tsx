"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit2, Save, AlertCircle } from "lucide-react";
import { editReceivePurchaseAction } from "@/app/actions/purchases";
import { toast } from "sonner";

export default function EditPurchaseQuantities({ purchase }: { purchase: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState(
    purchase.items.map((i: any) => ({
      id: i.id,
      productId: i.productId,
      name: i.productType?.name || "Producto",
      quantityOrdered: i.quantityOrdered,
      quantityGood: i.quantityGood,
      quantityDamaged: i.quantityDamaged, // En DB se guarda como quantityDamaged + quantityLost
      quantityLost: 0,
    }))
  );

  const handleUpdate = (id: string, field: string, val: string) => {
    const num = parseInt(val) || 0;
    setItems(items.map((i: any) => i.id === id ? { ...i, [field]: num } : i));
  };

  const handleSave = async () => {
    setLoading(true);
    const result = await editReceivePurchaseAction(purchase.id, items);
    if (result.success) {
      toast.success("Cantidades actualizadas y stock corregido");
      setIsOpen(false);
      window.location.reload();
    } else {
      toast.error(result.error || "Error al actualizar");
    }
    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="cursor-pointer">
          <Edit2 className="w-4 h-4 mr-2" /> Editar Recepción
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Corregir Cantidades Recibidas</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Ajusta las cantidades que llegaron bien o mal. El stock se recalculará automáticamente.
          </p>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-12 gap-4 font-bold text-xs uppercase text-muted-foreground border-b pb-2">
            <div className="col-span-5">Producto</div>
            <div className="col-span-2 text-center">Pedida</div>
            <div className="col-span-2 text-center text-green-600">Bien</div>
            <div className="col-span-2 text-center text-amber-600">Dañado</div>
          </div>

          {items.map((item: any) => (
            <div key={item.id} className="grid grid-cols-12 gap-4 items-center border-b pb-4 last:border-0">
              <div className="col-span-5">
                <div className="font-medium text-sm">{item.name}</div>
                {item.productId && (
                  <div className="text-[10px] text-muted-foreground">Variante asignada: Sí</div>
                )}
              </div>
              <div className="col-span-2 text-center text-sm font-bold">{item.quantityOrdered}</div>
              <div className="col-span-2">
                <Input 
                  type="number" 
                  value={item.quantityGood} 
                  onChange={(e) => handleUpdate(item.id, 'quantityGood', e.target.value)}
                  className="h-8 text-center"
                />
              </div>
              <div className="col-span-2">
                <Input 
                  type="number" 
                  value={item.quantityDamaged} 
                  onChange={(e) => handleUpdate(item.id, 'quantityDamaged', e.target.value)}
                  className="h-8 text-center"
                />
              </div>
            </div>
          ))}

          <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-800 rounded-lg text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p>Al guardar, el sistema restará el stock anterior e incrementará el nuevo valor en los productos que ya tengan una variante asignada.</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={loading}>Cancelar</Button>
          <Button onClick={handleSave} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
            {loading ? "Guardando..." : "Guardar Correcciones"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
