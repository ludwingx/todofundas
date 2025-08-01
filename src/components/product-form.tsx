"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
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
  const [form, setForm] = useState({
    phoneModelId: product?.phoneModelId || "",
    typeId: product?.typeId || "",
    supplierId: product?.supplierId || "",
    color: product?.color || "",
    stock: product?.stock || 0,
    minStock: product?.minStock || 5,
    priceRetail: product?.priceRetail || "",
    priceWholesale: product?.priceWholesale || "",
    costPrice: product?.costPrice || "",
  });
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

  // Generar nombre dinámicamente
  const selectedType = productTypes.find((t) => t.id === form.typeId)?.name || "";
  const selectedModel = phoneModels.find((m) => m.id === form.phoneModelId)?.name || "";
  const generatedName = selectedType && selectedModel ? `${selectedType} - ${selectedModel}` : "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    // Usar FormData para enviar imagen + datos
    const formData = new FormData();
    formData.append('name', generatedName);
    Object.entries(form).forEach(([key, value]) => formData.append(key, value as string));
    if (imageFile) formData.append('image', imageFile);
    await onSubmit(formData);
    setSubmitting(false);
  }

  return (
    <div className="w-full max-w-none p-0">
      <form className="space-y-6 w-full" onSubmit={handleSubmit}>
          <div className="flex flex-col md:flex-row gap-8">
            {/* Imagen */}
            <div className="md:w-1/3 flex flex-col items-center justify-start gap-4">
              <label className="block text-sm font-medium mb-1 w-full">Imagen</label>
              <Input name="image" type="file" accept="image/*" onChange={handleChange} disabled={loading || submitting} className="w-full" />
              {imagePreview && (
                <img src={imagePreview} alt="Vista previa" className="mt-2 rounded-xl border border-muted shadow-md max-h-48 w-auto object-contain bg-white" />
              )}
            </div>

            {/* Campos */}
            <div className="md:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <label className="block text-sm font-medium mb-1">Stock</label>
              <Input name="stock" type="number" value={form.stock} onChange={handleChange} min={0} required disabled={loading || submitting} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Stock mínimo</label>
              <Input name="minStock" type="number" value={form.minStock} onChange={handleChange} min={0} required disabled={loading || submitting} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Precio mayorista (BOB)</label>
              <Input name="priceWholesale" type="number" value={form.priceWholesale} onChange={handleChange} min={0} step="0.01" required disabled={loading || submitting} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Precio minorista (BOB)</label>
              <Input name="priceRetail" type="number" value={form.priceRetail} onChange={handleChange} min={0} step="0.01" required disabled={loading || submitting} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Precio costo (BOB)</label>
              <Input name="costPrice" type="number" value={form.costPrice} onChange={handleChange} min={0} step="0.01" required disabled={loading || submitting} />
            </div>
          </div>
          </div>
          <div className="pt-4">
            <Button type="submit" disabled={loading || submitting}>
              {submitting || loading ? "Guardando..." : "Guardar Producto"}
            </Button>
          </div>
      </form>
    </div>
  );
}

