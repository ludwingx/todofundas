"use client";

import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  WalletCards, 
  Plus, 
  Building2,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createWalletTransactionAction } from "@/app/actions/wallet";

export default function WalletClient({
  transactions,
  suppliers,
  balance,
  totalIngresos,
  totalEgresos
}: {
  transactions: any[];
  suppliers: { id: string; name: string }[];
  balance: number;
  totalIngresos: number;
  totalEgresos: number;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [type, setType] = useState<"ingreso" | "egreso">("ingreso");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("devolucion_proveedor");
  const [referenceId, setReferenceId] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await createWalletTransactionAction({
      type,
      amount: parseFloat(amount),
      reason,
      notes,
      referenceType: referenceId ? "Supplier" : undefined,
      referenceId: referenceId || undefined
    });

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Transacción registrada");
      setOpen(false);
      // Reset
      setAmount("");
      setNotes("");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-primary text-primary-foreground">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Saldo Actual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold flex items-center">
              <WalletCards className="w-6 h-6 mr-2 opacity-80" />
              Bs. {balance.toFixed(2)}
            </div>
            <p className="text-xs opacity-80 mt-1">Fondos disponibles por compensaciones</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Total Ingresos</CardTitle>
            <ArrowUpRight className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Bs. {totalIngresos.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Reembolsos y saldos a favor</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Total Egresos</CardTitle>
            <ArrowDownRight className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">Bs. {totalEgresos.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Pagos extra o ajustes</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" /> Nueva Transacción
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Registrar Movimiento</DialogTitle>
                <DialogDescription>Añade un ingreso o egreso a la wallet</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tipo</label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={type}
                      onChange={(e) => setType(e.target.value as "ingreso" | "egreso")}
                    >
                      <option value="ingreso">Ingreso (A favor)</option>
                      <option value="egreso">Egreso (En contra)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Monto (Bs.)</label>
                    <Input 
                      type="number" 
                      step="0.01" 
                      min="0.1" 
                      value={amount} 
                      onChange={(e) => setAmount(e.target.value)} 
                      required 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Motivo</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  >
                    <option value="devolucion_proveedor">Devolución / Reembolso de Proveedor</option>
                    <option value="compensacion_danos">Compensación por Daños</option>
                    <option value="ajuste_manual">Ajuste Manual</option>
                    <option value="pago_extra">Pago Extra</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Proveedor (Opcional)</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={referenceId}
                    onChange={(e) => setReferenceId(e.target.value)}
                  >
                    <option value="">Ninguno</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Notas</label>
                  <Textarea 
                    placeholder="Nos devolvió el dinero por 3 fundas dañadas..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={loading || !amount}>
                  {loading ? "Guardando..." : "Registrar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Movimientos</CardTitle>
          <CardDescription>Registro completo de ingresos y egresos</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No hay transacciones registradas</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="p-3 font-medium rounded-tl-lg">Fecha</th>
                    <th className="p-3 font-medium">Tipo</th>
                    <th className="p-3 font-medium">Motivo</th>
                    <th className="p-3 font-medium">Notas</th>
                    <th className="p-3 font-medium">Usuario</th>
                    <th className="p-3 font-medium text-right rounded-tr-lg">Monto</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {transactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-muted/10 transition-colors">
                      <td className="p-3 text-muted-foreground">
                        {format(new Date(tx.createdAt), "dd MMM yyyy, HH:mm", { locale: es })}
                      </td>
                      <td className="p-3">
                        {tx.type === "ingreso" ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">
                            <ArrowUpRight className="w-3 h-3 mr-1" /> Ingreso
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200">
                            <ArrowDownRight className="w-3 h-3 mr-1" /> Egreso
                          </Badge>
                        )}
                      </td>
                      <td className="p-3 capitalize">{tx.reason.replace(/_/g, " ")}</td>
                      <td className="p-3 text-muted-foreground max-w-[200px] truncate" title={tx.notes || ""}>
                        {tx.notes || "-"}
                      </td>
                      <td className="p-3">{tx.user.name}</td>
                      <td className={`p-3 text-right font-bold ${tx.type === "ingreso" ? "text-green-600" : "text-red-600"}`}>
                        {tx.type === "ingreso" ? "+" : "-"} Bs. {tx.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
