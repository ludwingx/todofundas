"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { ColorSelector } from "@/components/ui/color-selector";

export type ProductFormProps = {
  product?: any;
  productTypes: { id: string; name: string }[];
  suppliers: { id: string; name: string }[];
  phoneModels: { id: string; name: string }[];
  onSubmit: (data: any) => void | Promise<void>;
  loading?: boolean;
};

export function ProductForm({ product, productTypes, suppliers, phoneModels, onSubmit, loading }: ProductFormProps) {
  const [form, setForm] = useState(() => ({
    phoneModelId: product?.phoneModelId || "",
    typeId: product?.typeId || "",
    // Use a sentinel value for "Sin proveedor" because SelectItem cannot have empty string
    supplierId: (product?.supplierId ?? "__none__"),
    color: product?.color || "",
    // Convert stock to number and ensure it's a valid number
    stock: product?.stock ? Number(product.stock) : 0,
    minStock: product?.minStock ? Number(product.minStock) : 5,
    priceRetail: product?.priceRetail ? String(product.priceRetail) : "",
    priceWholesale: product?.priceWholesale ? String(product.priceWholesale) : "",
    costPrice: product?.costPrice ? String(product.costPrice) : "",
  }));
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File|null>(null);
  const [imagePreview, setImagePreview] = useState<string|null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, files } = e.target;
    if (type === "file" && files && files[0]) {
      setImageFile(files[0]);
      setImagePreview(URL.createObjectURL(files[0]));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  }

  function handleSelect(name: string, value: string) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  // Get selected type and model for display purposes only
  const selectedType = productTypes.find((t) => t.id === form.typeId)?.name || "";
  const selectedModel = phoneModels.find((m) => m.id === form.phoneModelId)?.name || "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    // Use FormData to send image + data
    const formData = new FormData();
    
    // Add all form fields except name (removed from schema)
    Object.entries(form).forEach(([key, value]) => {
      if (key === 'supplierId') {
        // If sentinel selected, omit supplierId so backend stores null
        if (value === '__none__') return;
      }
      formData.append(key, value as string);
    });
    
    // Add image if provided
    if (imageFile) {
      formData.append('image', imageFile);
    }
    
    try {
      await onSubmit(formData);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-none p-0">
      <form className="space-y-4 w-full" onSubmit={handleSubmit}>
          <div className="flex flex-col md:flex-row gap-6">
            {/* Imagen */}
            <div className="md:w-1/3 flex flex-col items-center justify-start gap-4">
              <label className="block text-sm font-medium mb-1 w-full">Imagen</label>
              <Input name="image" type="file" accept="image/*" onChange={handleChange} disabled={loading || submitting} className="w-full" />
              {imagePreview && (
                <img src={imagePreview} alt="Vista previa" className="mt-2 rounded-lg border border-muted shadow-sm max-h-40 w-auto object-contain bg-white" />
              )}
            </div>

            {/* Campos */}
            <div className="md:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Modelo</label>
              <Select value={form.phoneModelId} onValueChange={(v) => handleSelect("phoneModelId", v)}>
                <SelectTrigger disabled={loading || submitting}>
                  <SelectValue placeholder="Seleccionar modelo" />
                </SelectTrigger>
                <SelectContent>
                  {phoneModels.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tipo</label>
              <Select value={form.typeId} onValueChange={(v) => handleSelect("typeId", v)}>
                <SelectTrigger disabled={loading || submitting}>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {productTypes.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Proveedor</label>
              <Select value={form.supplierId} onValueChange={(v) => handleSelect("supplierId", v)}>
                <SelectTrigger disabled={loading || submitting}>
                  <SelectValue placeholder="Seleccionar proveedor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Sin proveedor</SelectItem>
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Color</label>
              <ColorSelector
                name="color"
                value={form.color}
                onChange={(value) => setForm((prev) => ({ ...prev, color: value }))}
                required
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <label className="block text-sm font-medium mb-1">Stock</label>
                <span className="text-xs text-muted-foreground" title="El stock se actualiza automáticamente con compras y ventas">
                  (solo lectura)
                </span>
              </div>
              <Input 
                name="stock" 
                type="number" 
                value={form.stock} 
                readOnly 
                className="bg-muted/50 cursor-not-allowed"
                aria-readonly="true"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Stock mínimo</label>
              <Input name="minStock" type="number" value={form.minStock} onChange={handleChange} min={0} required disabled={loading || submitting} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Precio mayorista (BOB)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Bs.</span>
                <Input name="priceWholesale" type="number" value={form.priceWholesale} onChange={handleChange} min={0} step="0.01" required disabled={loading || submitting} className="pl-8" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Precio minorista (BOB)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Bs.</span>
                <Input name="priceRetail" type="number" value={form.priceRetail} onChange={handleChange} min={0} step="0.01" required disabled={loading || submitting} className="pl-8" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Precio costo (BOB)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Bs.</span>
                <Input name="costPrice" type="number" value={form.costPrice} onChange={handleChange} min={0} step="0.01" required disabled={loading || submitting} className="pl-8" />
              </div>
            </div>
          </div>
          </div>
          <div className="pt-3 flex justify-end">
            <Button type="submit" disabled={loading || submitting}>
              {submitting || loading ? "Guardando..." : (product ? "Guardar cambios" : "Registrar Producto")}
            </Button>
          </div>
      </form>
    </div>
  );
}

