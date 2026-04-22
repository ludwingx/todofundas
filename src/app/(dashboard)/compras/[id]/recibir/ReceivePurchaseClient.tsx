"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { receivePurchaseAction } from "@/app/actions/purchases";

export default function ReceivePurchaseClient({ purchase }: { purchase: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Initialize form state from the purchase items
  const [items, setItems] = useState(
    purchase.items.map((item: any) => ({
      id: item.id,
      productId: item.productId,
      name: `${item.product.type.name} ${item.product.phoneModel.name} ${item.product.color ? item.product.color.name : ''}`.trim(),
      quantityOrdered: item.quantityOrdered,
      quantityGood: item.quantityGood || item.quantityOrdered, // Default to assuming all came good
      quantityDamaged: item.quantityDamaged || 0,
      quantityLost: 0, // NEW field
    }))
  );

  const handleUpdate = (id: string, field: "quantityGood" | "quantityDamaged" | "quantityLost", value: string) => {
    const numValue = value === "" ? 0 : parseInt(value, 10);
    setItems(items.map((item: any) => {
      if (item.id === id) {
        return { ...item, [field]: isNaN(numValue) ? 0 : Math.max(0, numValue) };
      }
      return item;
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await receivePurchaseAction(
      purchase.id,
      items.map((i: any) => ({
        id: i.id,
        productId: i.productId,
        quantityGood: i.quantityGood,
        quantityDamaged: i.quantityDamaged,
        quantityLost: i.quantityLost,
      }))
    );

    if (result.error) {
      toast.error(result.error);
      setLoading(false);
    } else {
      toast.success("Inventario actualizado correctamente");
      router.push("/compras");
    }
  };

  if (purchase.status === "recibido") {
    return (
      <div className="p-6 text-center border rounded-lg bg-muted/20">
        <h2 className="text-xl font-bold mb-2">Este pedido ya fue recibido</h2>
        <p className="text-muted-foreground mb-4">No se puede modificar el inventario nuevamente para esta orden.</p>
        <Button onClick={() => router.push("/compras")}>Volver a Compras</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Detalles del Pedido</CardTitle>
          <CardDescription>
            Proveedor: <span className="font-semibold text-foreground">{purchase.supplier.name}</span> <br/>
            Fecha: {new Date(purchase.createdAt).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3 rounded-tl-lg">Producto</th>
                  <th className="text-center p-3">Cantidad Pedida</th>
                  <th className="text-center p-3 text-green-600">Llegó Bien (✅)</th>
                  <th className="text-center p-3 text-orange-600">Dañado Vendible (⚠️)</th>
                  <th className="text-center p-3 text-red-600 rounded-tr-lg">Pérdida 100% (❌)</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item: any) => {
                  const totalReceived = item.quantityGood + item.quantityDamaged + item.quantityLost;
                  const isMissing = totalReceived < item.quantityOrdered;
                  const isOver = totalReceived > item.quantityOrdered;

                  return (
                    <tr key={item.id} className="border-b">
                      <td className="p-3 font-medium">{item.name}</td>
                      <td className="p-3 text-center">
                        <Badge variant="outline" className={`text-base ${isMissing ? 'border-yellow-400 text-yellow-600' : isOver ? 'border-purple-400 text-purple-600' : ''}`}>
                          {item.quantityOrdered}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Input
                          type="number"
                          min="0"
                          className="w-24 mx-auto text-center font-bold border-green-200 focus-visible:ring-green-500"
                          value={item.quantityGood || ""}
                          onChange={(e) => handleUpdate(item.id, "quantityGood", e.target.value)}
                        />
                      </td>
                      <td className="p-3">
                        <Input
                          type="number"
                          min="0"
                          className="w-24 mx-auto text-center font-bold border-orange-200 focus-visible:ring-orange-500"
                          value={item.quantityDamaged || ""}
                          onChange={(e) => handleUpdate(item.id, "quantityDamaged", e.target.value)}
                        />
                      </td>
                      <td className="p-3">
                        <Input
                          type="number"
                          min="0"
                          className="w-24 mx-auto text-center font-bold border-red-200 focus-visible:ring-red-500 bg-red-50 dark:bg-red-950/20"
                          value={item.quantityLost || ""}
                          onChange={(e) => handleUpdate(item.id, "quantityLost", e.target.value)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Guía de Recepción:</strong><br/>
            ✅ <strong>Llegó Bien:</strong> Va directo al stock sano disponible para la venta.<br/>
            ⚠️ <strong>Dañado Vendible:</strong> Producto con fallas leves (ej. sin logo). Va al almacén de "Stock Dañado" para venderse más barato.<br/>
            ❌ <strong>Pérdida 100%:</strong> Producto destruido o inutilizable. No entra a ningún stock, pero se registra la pérdida.
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-4 border-t p-6">
          <Button type="button" variant="outline" onClick={() => router.push("/compras")} className="cursor-pointer">Cancelar</Button>
          <Button type="submit" disabled={loading} className="cursor-pointer">
            {loading ? "Procesando..." : "Confirmar Recepción"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

