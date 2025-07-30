"use client";

import { useState, useEffect, useActionState } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ImageIcon, Tag, Smartphone, Palette, Coins, Boxes, StickyNote } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { ModelCombobox } from "@/components/model-combobox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { createProduct } from "@/app/actions/products";
import type { Warehouse, ProductType, Supplier } from "@prisma/client";

interface ProductFormProps {
  warehouses: Warehouse[];
  productTypes: ProductType[];
  suppliers: Supplier[];
}

const initialState: { error?: string; success?: boolean; productId?: string } = {};

export function ProductForm({ warehouses, productTypes, suppliers }: ProductFormProps) {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<any>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const router = useRouter();
  const [state, formAction] = useActionState(createProduct, initialState);

  useEffect(() => {
    if (state.success) {
      toast.success("¡Producto creado exitosamente!");
      router.push("/inventory/products");
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
      setFormData((fd: any) => ({ ...fd, image: file }));
    } else {
      setImagePreview(null);
      setFormData((fd: any) => ({ ...fd, image: undefined }));
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData((fd: any) => ({ ...fd, [name]: value }));
  }

  function handleComboboxChange(name: string, value: string) {
    setFormData((fd: any) => ({ ...fd, [name]: value }));
  }

  function nextStep() {
    setStep((s) => Math.min(s + 1, 2));
  }
  function prevStep() {
    setStep((s) => Math.max(s - 1, 0));
  }

  // Validaciones simples por paso
  function isStepValid() {
    if (step === 0) {
      return formData.typeId && formData.model && formData.color;
    }
    if (step === 1) {
      return formData.priceRetail && formData.priceWholesale && formData.costPrice && formData.stock;
    }
    return true;
  }

  return (
    <form id="product-form" action={formAction} className="w-full max-w-4xl px-2 md:px-6 mx-auto space-y-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Nuevo Producto</CardTitle>
          <div className="flex gap-2 mt-2">
            {["Datos Básicos", "Precios y Stock", "Proveedor y Notas"].map((label, i) => (
              <div key={label} className={cn(
                "flex-1 h-2 rounded-full",
                step >= i ? "bg-primary" : "bg-muted"
              )} title={label}></div>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {step === 0 && (
            <div className="grid gap-6">
              {/* Tipo de producto */}
              <div className="grid gap-2">
                <Label htmlFor="typeId">Tipo de Producto *</Label>
                <Select name="typeId" required value={formData.typeId || ""} onValueChange={v => handleComboboxChange("typeId", v)}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar tipo" /></SelectTrigger>
                  <SelectContent>
                    {productTypes.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {/* Modelo compatible */}
              <div className="grid gap-2">
                <Label htmlFor="model">Modelo Compatible *</Label>
                <ModelCombobox name="model" required onChange={v => handleComboboxChange("model", v)} />
              </div>
              {/* Color */}
              <div className="grid gap-2">
                <Label htmlFor="color">Color *</Label>
                <Input name="color" required value={formData.color || ""} onChange={handleChange} placeholder="Ej: Negro" />
              </div>
              {/* Imagen */}
              <div className="grid gap-2">
                <Label htmlFor="image">Imagen</Label>
                <label htmlFor="image" className="relative flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-lg cursor-pointer bg-muted/40 hover:bg-muted/60 transition-colors">
                  {imagePreview ? (
                    <Image src={imagePreview} alt="Vista previa" fill className="object-contain rounded-lg p-2" />
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center text-muted-foreground">
                      <ImageIcon className="w-8 h-8 mb-3" />
                      <p className="mb-1 text-xs font-semibold">Subir una imagen</p>
                      <p className="text-xs text-muted-foreground/80">Arrastra o haz clic aquí</p>
                    </div>
                  )}
                </label>
                <Input id="image" name="image" type="file" accept="image/*" onChange={handleImageChange} className="sr-only" />
              </div>
            </div>
          )}
          {step === 1 && (
            <div className="grid gap-6">
              {/* Precio por menor */}
              <div className="grid gap-2">
                <Label htmlFor="priceRetail">Precio Venta (Bs.) *</Label>
                <Input name="priceRetail" required type="number" step="0.01" min="0" value={formData.priceRetail || ""} onChange={handleChange} />
              </div>
              {/* Precio por mayor */}
              <div className="grid gap-2">
                <Label htmlFor="priceWholesale">Precio Mayorista (Bs.) *</Label>
                <Input name="priceWholesale" required type="number" step="0.01" min="0" value={formData.priceWholesale || ""} onChange={handleChange} />
              </div>
              {/* Precio de costo */}
              <div className="grid gap-2">
                <Label htmlFor="costPrice">Precio de Costo (Bs.) *</Label>
                <Input name="costPrice" required type="number" step="0.01" min="0" value={formData.costPrice || ""} onChange={handleChange} />
              </div>
              {/* Stock */}
              <div className="grid gap-2">
                <Label htmlFor="stock">Stock *</Label>
                <Input name="stock" required type="number" min="0" value={formData.stock || ""} onChange={handleChange} />
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="grid gap-6">
              {/* Proveedor */}
              <div className="grid gap-2">
                <Label htmlFor="supplierId">Proveedor (Opcional)</Label>
                <Select name="supplierId" value={formData.supplierId || ""} onValueChange={v => handleComboboxChange("supplierId", v)}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar proveedor" /></SelectTrigger>
                  <SelectContent>
                    {suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {/* Notas */}
              <div className="grid gap-2">
                <Label htmlFor="notes">Notas</Label>
                <Textarea id="notes" name="notes" value={formData.notes || ""} onChange={handleChange} placeholder="Observaciones, detalles, etc." className="min-h-24" />
              </div>
            </div>
          )}
          <div className="flex justify-between gap-4 mt-8">
            {step > 0 && (
              <button type="button" className="px-4 py-2 rounded bg-muted border border-input hover:bg-accent transition font-medium" onClick={prevStep}>
                Atrás
              </button>
            )}
            {step < 2 && (
              <button type="button" className="ml-auto px-6 py-2 rounded bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition shadow" onClick={nextStep} disabled={!isStepValid()}>
                Siguiente
              </button>
            )}
            {step === 2 && (
              <button type="submit" className="ml-auto px-6 py-2 rounded bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition shadow">
                Guardar Producto
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
