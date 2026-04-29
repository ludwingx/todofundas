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
import { Edit2, Save, AlertCircle, Package, Search, ChevronRight } from "lucide-react";
import { editReceivePurchaseAction } from "@/app/actions/purchases";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export default function EditPurchaseQuantities({ 
  purchase,
  availableProducts = []
}: { 
  purchase: any;
  availableProducts?: any[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openSelectors, setOpenSelectors] = useState<Record<string, boolean>>({});
  const [items, setItems] = useState(
    purchase.items.map((i: any) => ({
      id: i.id,
      productId: i.productId,
      name: i.product 
        ? `${i.product.type.name} ${i.product.phoneModel.name}`
        : i.productType?.name || "Producto",
      colorName: i.product?.color?.name || null,
      imageUrl: i.product?.imageUrl || null,
      quantityOrdered: i.quantityOrdered,
      quantityGood: i.quantityGood,
      quantityDamaged: i.quantityDamaged, 
      quantityLost: 0,
    }))
  );

  const handleUpdate = (id: string, field: string, val: any) => {
    setItems(items.map((i: any) => {
      if (i.id === id) {
        if (field === 'productId') {
          const product = availableProducts.find(p => p.id === val);
          return { 
            ...i, 
            productId: val,
            name: product ? `${product.type.name} ${product.phoneModel.name}` : i.name,
            colorName: product?.color?.name || null,
            imageUrl: product?.imageUrl || null
          };
        }
        return { ...i, [field]: typeof val === 'string' ? (parseInt(val) || 0) : val };
      }
      return i;
    }));
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
            <div className={purchase.status === 'pendiente' ? "col-span-10" : "col-span-8"}>Producto / Variante</div>
            {purchase.status === 'pendiente' ? (
              <div className="col-span-2 text-center">Pedido</div>
            ) : (
              <>
                <div className="col-span-2 text-center text-green-600">Bien</div>
                <div className="col-span-2 text-center text-amber-600">Dañado</div>
              </>
            )}
          </div>

          {items.map((item: any) => (
            <div key={item.id} className="grid grid-cols-12 gap-4 items-center border-b pb-4 last:border-0">
              <div className={purchase.status === 'pendiente' ? "col-span-10" : "col-span-8"}>
                {/* ... existing product selector ... */}
                {item.productId ? (
                  <Popover 
                    open={openSelectors[item.id]} 
                    onOpenChange={(open) => setOpenSelectors(prev => ({ ...prev, [item.id]: open }))}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-auto p-2 w-full justify-start hover:bg-muted/50 rounded-xl transition-all"
                      >
                        <div className="flex items-center gap-3 w-full">
                          <div className="h-10 w-10 rounded-lg border bg-muted overflow-hidden flex-shrink-0">
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center bg-muted/50">
                                <Package className="h-5 w-5 opacity-30" />
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-start text-left flex-1 min-w-0">
                            <div className="font-bold text-sm leading-tight truncate w-full">{item.name}</div>
                            {item.colorName && (
                              <div className="text-[10px] text-muted-foreground uppercase font-medium">Color: {item.colorName}</div>
                            )}
                            <div className="text-[10px] text-green-600 font-bold uppercase mt-1">Cambiar producto <ChevronRight className="inline h-2 w-2" /></div>
                          </div>
                        </div>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0 rounded-xl shadow-2xl border-none" align="start">
                      <Command className="rounded-xl">
                        <CommandInput placeholder="Buscar producto..." className="h-10" />
                        <CommandInput placeholder="Buscar producto..." className="h-10" />
                        <CommandList className="max-h-[300px]">
                          <CommandEmpty>No se encontraron productos.</CommandEmpty>
                          <CommandGroup heading="Productos Disponibles">
                            {availableProducts.map((p: any) => (
                              <CommandItem
                                key={p.id}
                                value={`${p.type.name} ${p.phoneModel.name} ${p.color?.name || ''}`}
                                onSelect={() => {
                                  handleUpdate(item.id, 'productId', p.id);
                                  setOpenSelectors(prev => ({ ...prev, [item.id]: false }));
                                }}
                                className="flex items-center gap-3 py-2 px-3 cursor-pointer"
                              >
                                <div className="h-10 w-10 rounded-lg border bg-muted overflow-hidden flex-shrink-0">
                                  {p.imageUrl ? (
                                    <img src={p.imageUrl} alt="" className="h-full w-full object-cover" />
                                  ) : (
                                    <div className="h-full w-full flex items-center justify-center bg-muted/50">
                                      <Package className="h-5 w-5 opacity-30" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex flex-col gap-0.5">
                                  <span className="font-bold text-xs">{p.type.name} {p.phoneModel.name}</span>
                                  <span className="text-[10px] text-muted-foreground">{p.color?.name || 'Sin color'}</span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                ) : (
                  <div className="px-2">
                    <div className="font-bold text-sm leading-tight">{item.name}</div>
                    <div className="text-[10px] text-amber-600 font-bold uppercase mt-1 italic">Pendiente de asignación</div>
                  </div>
                )}
              </div>
              
              {purchase.status === 'pendiente' ? (
                <div className="col-span-2 text-center">
                  <Input 
                    type="number" 
                    value={item.quantityOrdered} 
                    onChange={(e) => handleUpdate(item.id, 'quantityOrdered', e.target.value)}
                    className="h-8 text-center"
                  />
                </div>
              ) : (
                <>
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
                </>
              )}
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
