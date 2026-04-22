"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle } from "lucide-react";
import { reportDamagedProductAction } from "@/app/actions/products";

interface ProductDamageDialogProps {
  product: {
    id: string;
    displayName: string;
    stock: number;
  };
  trigger?: React.ReactNode;
}

export default function ProductDamageDialog({ product, trigger }: ProductDamageDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quantity, setQuantity] = useState<number>(1);
  const [type, setType] = useState<"absolute_loss" | "damaged_stock">("damaged_stock");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (quantity <= 0 || quantity > product.stock) {
      toast({
        title: "Cantidad inválida",
        description: "La cantidad debe ser mayor a 0 y no exceder el stock actual.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    const result = await reportDamagedProductAction(product.id, quantity, type, notes);

    if (result.success) {
      toast({
        title: "Registro exitoso",
        description: type === "absolute_loss" ? "Pérdida absoluta registrada." : "Stock dañado actualizado.",
      });
      setOpen(false);
      setQuantity(1);
      setNotes("");
    } else {
      toast({
        title: "Error",
        description: result.error || "No se pudo registrar la operación.",
        variant: "destructive",
      });
    }

    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 cursor-pointer">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Declarar Daño
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="h-5 w-5" />
              Declarar Daño / Pérdida
            </DialogTitle>
            <DialogDescription>
              Registra si unidades de <strong className="text-foreground">{product.displayName}</strong> se dañaron o perdieron. (Stock actual: {product.stock})
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label>Tipo de Daño / Pérdida</Label>
              <RadioGroup value={type} onValueChange={(val) => setType(val as "absolute_loss" | "damaged_stock")} className="flex flex-col gap-3 mt-2">
                <div className="flex items-start space-x-3 rounded-md border p-3 cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => setType("damaged_stock")}>
                  <RadioGroupItem value="damaged_stock" id="damaged_stock" className="mt-1 cursor-pointer" />
                  <div className="space-y-1">
                    <Label htmlFor="damaged_stock" className="font-medium cursor-pointer">Mover a Stock Dañado</Label>
                    <p className="text-xs text-muted-foreground">El producto sigue físicamente, pero no se puede vender a precio normal (ej. llegó borroso, fallas leves).</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 rounded-md border p-3 border-red-200 bg-red-50/50 dark:bg-red-950/20 cursor-pointer hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors" onClick={() => setType("absolute_loss")}>
                  <RadioGroupItem value="absolute_loss" id="absolute_loss" className="mt-1 cursor-pointer" />
                  <div className="space-y-1">
                    <Label htmlFor="absolute_loss" className="font-medium text-red-700 dark:text-red-400 cursor-pointer">Pérdida Absoluta (100%)</Label>
                    <p className="text-xs text-muted-foreground">El producto no se puede vender ni recuperar (ej. destruido, robado, quemado por el sol).</p>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">
                Cantidad
              </Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max={product.stock}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="col-span-3"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="notes" className="text-right mt-2">
                Motivo / Notas
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej. Se quemó con el sol en exhibición..."
                className="col-span-3 resize-none h-20"
                required
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="cursor-pointer">
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} variant={type === "absolute_loss" ? "destructive" : "default"} className="cursor-pointer">
              {isSubmitting ? "Procesando..." : "Registrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
