"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { assignStockAction } from "@/app/actions/purchases";
import { Package, ArrowRight, AlertTriangle, Plus } from "lucide-react";
import { RegisterProductDialog } from "@/app/(dashboard)/inventario/productos/RegisterProductDialog";

interface PurchaseItemAssignment {
  purchaseItemId: string;
  originalItem: any;
  productId: string;
  quantityGood: number;
  quantityDamaged: number;
}

export default function AssignStockClient({ 
  purchase, 
  availableProducts,
  metadata 
}: { 
  purchase: any, 
  availableProducts: any[],
  metadata: any
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Initial state: one assignment per purchase item
  const [assignments, setAssignments] = useState<PurchaseItemAssignment[]>(
    purchase.items.map((item: any) => ({
      purchaseItemId: item.id,
      originalItem: item,
      productId: "",
      quantityGood: 0,
      quantityDamaged: 0
    }))
  );

  const handleProductChange = (index: number, productId: string) => {
    const newAssignments = [...assignments];
    newAssignments[index].productId = productId;
    setAssignments(newAssignments);
  };

  const handleAddVariant = (purchaseItemId: string) => {
    const itemToCopy = assignments.find(a => a.purchaseItemId === purchaseItemId);
    if (!itemToCopy) return;

    const newAssignments = [...assignments];
    const index = newAssignments.findLastIndex(a => a.purchaseItemId === purchaseItemId);
    
    // Add new row after the last occurrence of this item
    newAssignments.splice(index + 1, 0, {
      purchaseItemId: itemToCopy.purchaseItemId,
      originalItem: itemToCopy.originalItem,
      productId: "",
      quantityGood: 0,
      quantityDamaged: 0
    });

    setAssignments(newAssignments);
  };

  const handleQuantityChange = (index: number, field: 'quantityGood' | 'quantityDamaged', value: number) => {
    const newAssignments = [...assignments];
    const item = newAssignments[index];
    const otherItemsWithSameId = newAssignments.filter((a, i) => a.purchaseItemId === item.purchaseItemId && i !== index);
    
    const totalOtherGood = otherItemsWithSameId.reduce((sum, a) => sum + a.quantityGood, 0);
    const totalOtherDamaged = otherItemsWithSameId.reduce((sum, a) => sum + a.quantityDamaged, 0);
    
    const maxGood = item.originalItem.quantityGood - totalOtherGood;
    const maxDamaged = item.originalItem.quantityDamaged - totalOtherDamaged;

    const safeValue = Math.min(Math.max(0, value), field === 'quantityGood' ? maxGood : maxDamaged);
    
    newAssignments[index][field] = safeValue;
    setAssignments(newAssignments);
  };

  const handleSubmit = async () => {
    const unassigned = assignments.some(a => !a.productId);
    if (unassigned) {
      toast.error("Por favor, asigna un producto a todas las líneas");
      return;
    }

    setLoading(true);
    const result = await assignStockAction(purchase.id, assignments.map(a => ({
      purchaseItemId: a.purchaseItemId,
      productId: a.productId,
      quantityGood: a.quantityGood,
      quantityDamaged: a.quantityDamaged
    })));

    if (result.success) {
      toast.success("Stock asignado correctamente");
      router.push("/compras");
    } else {
      toast.error(result.error || "Error al asignar stock");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Pedido #{purchase.id.slice(0, 8).toUpperCase()}</CardTitle>
              <CardDescription>Proveedor: {purchase.supplier.name}</CardDescription>
            </div>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {assignments.length} Líneas a Procesar
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <div className="space-y-4">
        {assignments.map((assignment, index) => (
          <Card key={`${assignment.purchaseItemId}-${index}`} className="overflow-hidden transition-all hover:shadow-md border-muted">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 md:grid-cols-12 items-center">
                {/* Source Info */}
                <div className="md:col-span-4 p-4 bg-muted/30 border-r">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Origen (Recibido Genérico)</span>
                    <span className="font-semibold">{assignment.originalItem.productType.name}</span>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline" className="text-[10px] border-green-200 text-green-700 bg-green-50">
                        Total ✅: {assignment.originalItem.quantityGood}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] border-amber-200 text-amber-700 bg-amber-50">
                        Total ⚠️: {assignment.originalItem.quantityDamaged}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Arrow Icon */}
                <div className="hidden md:flex md:col-span-1 justify-center">
                  <ArrowRight className="text-muted-foreground w-5 h-5" />
                </div>

                {/* Destination Info */}
                <div className="md:col-span-7 p-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-muted-foreground uppercase">Asignar a Variante:</label>
                        <RegisterProductDialog 
                          {...metadata}
                        />
                      </div>
                      <Select 
                        value={assignment.productId} 
                        onValueChange={(val) => handleProductChange(index, val)}
                      >
                        <SelectTrigger className="w-full h-10">
                          <SelectValue placeholder="Seleccionar producto específico..." />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {availableProducts.map(p => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.type.name} - {p.phoneModel.name} - {p.color?.name || 'S/C'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-end justify-between gap-4">
                      <div className="flex gap-4">
                         <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-green-600 uppercase">Cant. Bien</label>
                          <input 
                            type="number" 
                            className="w-20 h-9 border rounded-md text-center text-sm px-2 focus:ring-1 focus:ring-primary outline-none"
                            value={assignment.quantityGood}
                            onChange={(e) => handleQuantityChange(index, 'quantityGood', parseInt(e.target.value) || 0)}
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-amber-600 uppercase">Cant. Dañado</label>
                          <input 
                            type="number" 
                            className="w-20 h-9 border rounded-md text-center text-sm px-2 focus:ring-1 focus:ring-primary outline-none"
                            value={assignment.quantityDamaged}
                            onChange={(e) => handleQuantityChange(index, 'quantityDamaged', parseInt(e.target.value) || 0)}
                          />
                        </div>
                      </div>

                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-9"
                        onClick={() => handleAddVariant(assignment.purchaseItemId)}
                        title="Añadir otra variante para este mismo item"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1.5" />
                        Añadir Variante
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-between p-6 bg-muted/20 rounded-xl border border-dashed mt-8">
        <div className="flex items-center gap-3 text-muted-foreground text-sm">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <p>Al confirmar, el stock se incrementará en los productos seleccionados y se registrarán los movimientos de inventario.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push("/compras")} disabled={loading}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={loading} className="px-8 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-lg shadow-blue-500/20">
            {loading ? "Procesando..." : "Confirmar Asignación de Stock"}
          </Button>
        </div>
      </div>
    </div>
  );
}
