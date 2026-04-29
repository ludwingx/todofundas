"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
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
      <Card className="border-none shadow-sm bg-background">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl font-bold tracking-tight">Pedido #{purchase.id.slice(0, 8).toUpperCase()}</CardTitle>
              <div className="flex flex-col gap-0.5">
                <CardDescription className="text-muted-foreground font-medium">Proveedor: {purchase.supplier.name}</CardDescription>
                <div className="flex items-center gap-4 mt-1">
                  <div className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded-lg border border-muted-foreground/10">
                    <span className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-wider">Items Pedidos:</span>
                    <span className="text-xs font-bold">{purchase.items.reduce((sum: number, item: any) => sum + item.quantityGood + item.quantityDamaged, 0)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded-lg border border-muted-foreground/10">
                    <span className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-wider">Costo Promedio:</span>
                    <span className="text-xs font-bold">{(purchase.totalAmount / purchase.items.reduce((sum: number, item: any) => sum + item.quantityGood + item.quantityDamaged, 0)).toFixed(2)} Bs</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded-lg border border-muted-foreground/10">
                    <span className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-wider">Inversión Total:</span>
                    <span className="text-xs font-bold">{purchase.totalAmount.toFixed(2)} Bs</span>
                  </div>
                </div>
              </div>
            </div>
            <Badge variant="secondary" className="px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider">
              {assignments.length} Líneas a Procesar
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {purchase.items.map((originalItem: any) => {
        const itemAssignments = assignments.filter(a => a.purchaseItemId === originalItem.id);
        const assignedGood = itemAssignments.reduce((sum, a) => sum + a.quantityGood, 0);
        const assignedDamaged = itemAssignments.reduce((sum, a) => sum + a.quantityDamaged, 0);
        const remainingGood = originalItem.quantityGood - assignedGood;
        const remainingDamaged = originalItem.quantityDamaged - assignedDamaged;
        const isComplete = remainingGood === 0 && remainingDamaged === 0;

        return (
          <Card key={originalItem.id} className={cn("overflow-hidden transition-all border-2", isComplete ? "border-muted/30" : "border-foreground")}>
            {/* Header del Item de Compra */}
            <CardHeader className="bg-muted/20 border-b border-muted px-6 py-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  {/* Indicador de progreso circular */}
                  <div className={cn("h-12 w-12 rounded-full border-2 flex items-center justify-center flex-shrink-0", isComplete ? "border-foreground bg-foreground text-background" : "border-foreground/20")}>
                    {isComplete ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    ) : (
                      <span className="font-black text-sm">{itemAssignments.length}</span>
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold tracking-tight">{originalItem.productType.name}</CardTitle>
                  </div>
                </div>
                
                {/* Status de asignación */}
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">
                    {isComplete ? "COMPLETADO" : "PENDIENTE"}
                  </span>
                  <div className="flex gap-3 text-xs font-bold">
                    <span className={cn(remainingGood === 0 ? "text-muted-foreground/40" : "text-foreground")}>
                      Bien: {remainingGood}/{originalItem.quantityGood}
                    </span>
                    <span className={cn(remainingDamaged === 0 ? "text-muted-foreground/40" : "text-foreground")}>
                      Dañado: {remainingDamaged}/{originalItem.quantityDamaged}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-4">
              {/* Lista de Asignaciones */}
              <div className="space-y-3">
                {itemAssignments.map((assignment, index) => {
                  const assignmentIndex = assignments.findIndex(a => a === assignment);
                  
                  return (
                    <div key={`${assignment.purchaseItemId}-${index}`} className="group relative bg-background border-2 border-muted rounded-xl p-4 hover:border-foreground/20 transition-all">
                      {/* Número de variante */}
                      <div className="absolute -top-3 -left-3 h-6 w-6 rounded-full bg-foreground text-background flex items-center justify-center text-[10px] font-black">
                        {index + 1}
                      </div>
                      
                      <div className="flex flex-col lg:flex-row gap-4">
                        {/* Selector de Producto */}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                              Asignar a Producto Específico
                            </label>
                            <RegisterProductDialog {...metadata} />
                          </div>
                          <Select 
                            value={assignment.productId} 
                            onValueChange={(val) => handleProductChange(assignmentIndex, val)}
                          >
                            <SelectTrigger className="!h-18 w-full rounded-xl border-1 bg-background transition-all focus:border-foreground">
                              <SelectValue className="text-base text-foreground" placeholder="Seleccionar variante de producto..." />
                            </SelectTrigger>
                            <SelectContent className="max-h-[400px] rounded-xl shadow-2xl">
                              {availableProducts.map(p => (
                                <SelectItem key={p.id} value={p.id} className="focus:bg-muted/50 rounded-xl py-4 px-3">
                                  <div className="flex items-center gap-4">
                                    <div className="h-14 w-14 rounded-xl border bg-muted overflow-hidden flex-shrink-0">
                                      {p.imageUrl ? (
                                        <img src={p.imageUrl} alt="" className="h-full w-full object-cover" />
                                      ) : (
                                        <div className="h-full w-full flex items-center justify-center bg-muted/50">
                                          <Package className="h-7 w-7 opacity-30" />
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                      <span className="font-bold text-base">{p.type.name} {p.phoneModel.name}</span>
                                      <span className="text-sm text-muted-foreground">{p.color?.name || 'Sin color'}</span>
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Cantidades */}
                        <div className="flex items-end gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground block">
                              Unidades Bien
                            </label>
                            <div className="relative">
                              <input 
                                type="number" 
                                className="w-24 h-12 border-2 rounded-xl text-center font-bold text-lg px-2 focus:border-foreground transition-all outline-none"
                                value={assignment.quantityGood}
                                onChange={(e) => handleQuantityChange(assignmentIndex, 'quantityGood', parseInt(e.target.value) || 0)}
                              />
                              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">✅</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground block">
                              Unidades Dañadas
                            </label>
                            <div className="relative">
                              <input 
                                type="number" 
                                className="w-24 h-12 border-2 rounded-xl text-center font-bold text-lg px-2 focus:border-foreground transition-all outline-none"
                                value={assignment.quantityDamaged}
                                onChange={(e) => handleQuantityChange(assignmentIndex, 'quantityDamaged', parseInt(e.target.value) || 0)}
                              />
                              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">⚠️</span>
                            </div>
                          </div>
                          
                          {/* Botón de eliminar variante */}
                          {itemAssignments.length > 1 && (
                            <Button 
                              variant="outline" 
                              size="icon"
                              className="h-12 w-12 rounded-xl border-2 border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all"
                              onClick={() => {
                                const newAssignments = [...assignments];
                                const idx = newAssignments.findIndex(a => a === assignment);
                                newAssignments.splice(idx, 1);
                                setAssignments(newAssignments);
                                toast.info("Variante eliminada");
                              }}
                            >
                              <Plus className="w-5 h-5 rotate-45" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Botón Añadir Variante - Prominente con texto */}
              {!isComplete && (
                <Button 
                  variant="outline"
                  className="w-full h-14 rounded-xl border-2 border-dashed border-foreground/30 hover:border-foreground hover:bg-muted/30 transition-all group"
                  onClick={() => handleAddVariant(originalItem.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-foreground text-background flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Plus className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="font-bold text-sm">Añadir Otra Variante</span>
                      <span className="text-[10px] text-muted-foreground font-medium">
                        Para distribuir el stock en múltiples productos
                      </span>
                    </div>
                  </div>
                </Button>
              )}

              {/* Mensaje cuando está completo */}
              {isComplete && (
                <div className="flex items-center gap-3 p-4 bg-foreground/5 rounded-xl border border-foreground/10">
                  <div className="h-8 w-8 rounded-full bg-foreground text-background flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span className="font-bold text-sm">Todas las unidades han sido asignadas</span>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      <div className="flex items-center justify-between p-8 bg-background rounded-[2rem] border-2 border-dashed mt-12 mb-8">
        <div className="flex items-center gap-4 text-muted-foreground">
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <p className="text-xs font-medium max-w-md leading-relaxed">Al confirmar, el stock se incrementará en los productos seleccionados y se registrarán los movimientos de inventario automáticamente.</p>
        </div>
        <div className="flex gap-4">
          <Button variant="ghost" className="rounded-xl font-bold px-6" onClick={() => router.push("/compras")} disabled={loading}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={loading} className="px-10 h-12 rounded-xl bg-foreground text-background hover:bg-foreground/90 font-bold uppercase tracking-widest text-xs shadow-xl transition-all active:scale-95">
            {loading ? "Procesando..." : "Confirmar Asignación"}
          </Button>
        </div>
      </div>
    </div>
  );
}
