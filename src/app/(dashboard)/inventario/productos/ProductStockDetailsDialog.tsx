"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  History, 
  Package, 
  Calendar, 
  User, 
  TrendingDown, 
  AlertCircle 
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface PurchaseItemWithDetails {
  id: string;
  quantityOrdered: number;
  quantityGood: number;
  quantityDamaged: number;
  unitCost: number;
  createdAt: Date;
  purchase: {
    id: string;
    supplier: {
      name: string;
    };
  };
}

interface ProductStockDetailsDialogProps {
  product: {
    id: string;
    displayName: string;
    stock: number;
    stockDamaged: number;
    purchaseItems: PurchaseItemWithDetails[];
  };
}

export default function ProductStockDetailsDialog({ product }: ProductStockDetailsDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="group cursor-pointer"
          title="Historial de Lotes / Costos"
        >
          <History className="h-4 w-4 text-slate-600 group-hover:text-blue-600 transition-colors" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">{product.displayName}</DialogTitle>
              <p className="text-sm text-muted-foreground">Trazabilidad de lotes e ingresos</p>
            </div>
          </div>
        </DialogHeader>

        {/* Resumen de Stock Actual */}
        <div className="grid grid-cols-2 gap-4 my-6">
          <div className="bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30 rounded-xl p-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-green-600 block mb-1">Stock Disponible</span>
            <span className="text-3xl font-black text-green-700">{product.stock} <small className="text-sm font-normal">uds.</small></span>
          </div>
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-xl p-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 block mb-1">Stock Dañado</span>
            <span className="text-3xl font-black text-amber-700">{product.stockDamaged} <small className="text-sm font-normal">uds.</small></span>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-sm uppercase tracking-widest flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-blue-500" />
            Historial de Ingresos (Lotes)
          </h3>
          
          <div className="rounded-xl border border-gray-100 dark:border-white/5 overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50 dark:bg-white/5">
                <TableRow>
                  <TableHead className="text-[10px] font-black uppercase">Fecha / ID</TableHead>
                  <TableHead className="text-[10px] font-black uppercase">Proveedor</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-center">Cant. Recibida</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-right">Costo Unit.</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-right">Inversión</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {product.purchaseItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground italic">
                      No hay registros de compras para este producto.
                    </TableCell>
                  </TableRow>
                ) : (
                  product.purchaseItems.map((item) => (
                    <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-xs flex items-center gap-1">
                            <Calendar className="h-3 w-3 opacity-40" />
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                          <span className="text-[8px] uppercase font-mono opacity-40">#{item.purchase.id.slice(0,8)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded bg-gray-100 dark:bg-white/10 flex items-center justify-center">
                            <User className="h-3 w-3 opacity-40" />
                          </div>
                          <span className="text-xs font-medium">{item.purchase.supplier.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-bold text-xs">{item.quantityGood + item.quantityDamaged}</span>
                          <div className="flex gap-1">
                            <Badge variant="outline" className="px-1 py-0 text-[8px] bg-green-50 text-green-700 border-green-200">{item.quantityGood}</Badge>
                            {item.quantityDamaged > 0 && (
                              <Badge variant="outline" className="px-1 py-0 text-[8px] bg-amber-50 text-amber-700 border-amber-200">{item.quantityDamaged}</Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-xs font-bold text-blue-600">Bs. {item.unitCost.toFixed(2)}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-xs font-black">Bs. {((item.quantityGood + item.quantityDamaged) * item.unitCost).toFixed(2)}</span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-lg text-[10px] font-medium leading-relaxed italic">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p>
              Nota: Este historial muestra todos los ingresos de mercadería. El stock disponible arriba es el consolidado actual después de ventas y ajustes.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
