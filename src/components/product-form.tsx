"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Checkbox } from "./ui/checkbox";

export type ProductFormProps = {
  product?: {
    phoneModelId?: string;
    typeId?: string;
    supplierId?: string | null;
    colorId?: string;
    materialId?: string | null;
    compatibilityId?: string | null;
    stock?: number;
    minStock?: number;
    priceRetail?: number | string;
    priceWholesale?: number | string;
    costPrice?: number | string;
    hasDiscount?: boolean;
    discountPercentage?: number | null;
    discountPrice?: number | null;
  };
  productTypes: { id: string; name: string }[];
  suppliers: { id: string; name: string }[];
  phoneModels: { id: string; name: string }[];
  colors: { id: string; name: string; hexCode: string }[];
  materials: { id: string; name: string }[];
  compatibilities: { id: string; name: string; deviceType: string }[];
  onSubmit: (data: FormData) => void | Promise<void>;
  loading?: boolean;
};

export function ProductForm({
  product,
  productTypes,
  suppliers,
  phoneModels,
  colors,
  materials,
  compatibilities,
  onSubmit,
  loading,
}: ProductFormProps) {
  const [form, setForm] = useState(() => ({
    phoneModelId: product?.phoneModelId || "",
    typeId: product?.typeId || "",
    supplierId: product?.supplierId ?? "__none__",
    colorId: product?.colorId || (colors.length > 0 ? colors[0].id : ""),
    materialId: product?.materialId || "__none__",
    compatibilityId: product?.compatibilityId || "__none__",
    stock: product?.stock ? Number(product.stock) : 0,
    minStock: product?.minStock ? Number(product.minStock) : 5,
    priceRetail: product?.priceRetail ? String(product.priceRetail) : "",
    priceWholesale: product?.priceWholesale
      ? String(product.priceWholesale)
      : "",
    costPrice: product?.costPrice ? String(product.costPrice) : "",
    hasDiscount: product?.hasDiscount || false,
    discountPercentage: product?.discountPercentage
      ? String(product.discountPercentage)
      : "",
  }));

  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [discountPrice, setDiscountPrice] = useState<number>(0);

  // Calculate discount price when retail price or discount percentage changes
  useEffect(() => {
    if (form.hasDiscount && form.discountPercentage && form.priceRetail) {
      const retail = Number(form.priceRetail);
      const discount = Number(form.discountPercentage);
      const calculated = retail - (retail * discount) / 100;
      setDiscountPrice(calculated);
    } else {
      setDiscountPrice(0);
    }
  }, [form.hasDiscount, form.discountPercentage, form.priceRetail]);

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData();

    // Add all form fields
    Object.entries(form).forEach(([key, value]) => {
      if (
        key === "supplierId" ||
        key === "materialId" ||
        key === "compatibilityId"
      ) {
        // Skip if sentinel value
        if (value === "__none__") return;
        if (value) formData.append(key, value as string);
        return;
      }

      // Convert numeric values
      if (
        [
          "stock",
          "minStock",
          "priceRetail",
          "priceWholesale",
          "costPrice",
          "discountPercentage",
        ].includes(key)
      ) {
        if (value !== "" && value !== undefined) {
          formData.append(key, value.toString());
        }
      } else if (key === "hasDiscount") {
        formData.append(key, value.toString());
      } else if (value !== undefined && value !== null && value !== "") {
        formData.append(key, value as string);
      }
    });

    // Add calculated discount price
    if (form.hasDiscount && discountPrice > 0) {
      formData.append("discountPrice", discountPrice.toString());
    }

    // Add image if provided
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      await onSubmit(formData);
    } finally {
      setSubmitting(false);
    }
  }

  const selectedColor = colors.find((c) => c.id === form.colorId);

  return (
    <div className="w-full max-w-none p-0">
      <form className="space-y-4 w-full" onSubmit={handleSubmit}>
        <div className="flex flex-col md:flex-row gap-6">
          {/* Imagen */}
          <div className="md:w-1/3 flex flex-col items-center justify-start gap-4">
            <label className="block text-sm font-medium mb-1 w-full">
              Imagen
            </label>
            <Input
              name="image"
              type="file"
              accept="image/*"
              onChange={handleChange}
              disabled={loading || submitting}
              className="w-full"
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Vista previa"
                className="mt-2 rounded-lg border border-muted shadow-sm max-h-40 w-auto object-contain bg-white"
              />
            )}
          </div>

          {/* Campos */}
          <div className="md:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Modelo</label>
              <Select
                value={form.phoneModelId}
                onValueChange={(v) => handleSelect("phoneModelId", v)}
              >
                <SelectTrigger disabled={loading || submitting}>
                  <SelectValue placeholder="Seleccionar modelo" />
                </SelectTrigger>
                <SelectContent>
                  {phoneModels.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Tipo</label>
              <Select
                value={form.typeId}
                onValueChange={(v) => handleSelect("typeId", v)}
              >
                <SelectTrigger disabled={loading || submitting}>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {productTypes.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Color *</label>
              <Select
                value={form.colorId}
                onValueChange={(v) => handleSelect("colorId", v)}
              >
                <SelectTrigger disabled={loading || submitting}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full border flex-shrink-0"
                      style={{
                        backgroundColor: selectedColor?.hexCode || "#000",
                      }}
                    />
                    <span>{selectedColor?.name || "Seleccionar"}</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {colors.map((color) => (
                    <SelectItem key={color.id} value={color.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full border flex-shrink-0"
                          style={{ backgroundColor: color.hexCode }}
                        />
                        <span>{color.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Material (Opcional)
              </label>
              <Select
                value={form.materialId}
                onValueChange={(v) => handleSelect("materialId", v)}
              >
                <SelectTrigger disabled={loading || submitting}>
                  <SelectValue placeholder="Sin material" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Sin material</SelectItem>
                  {materials.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                Compatibilidad (Opcional)
              </label>
              <Select
                value={form.compatibilityId}
                onValueChange={(v) => handleSelect("compatibilityId", v)}
              >
                <SelectTrigger disabled={loading || submitting}>
                  <SelectValue placeholder="Sin compatibilidad específica" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Sin compatibilidad</SelectItem>
                  {compatibilities.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} ({c.deviceType})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Proveedor
              </label>
              <Select
                value={form.supplierId}
                onValueChange={(v) => handleSelect("supplierId", v)}
              >
                <SelectTrigger disabled={loading || submitting}>
                  <SelectValue placeholder="Seleccionar proveedor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Sin proveedor</SelectItem>
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Stock mínimo
              </label>
              <Input
                name="minStock"
                type="number"
                value={form.minStock}
                onChange={handleChange}
                min={0}
                required
                disabled={loading || submitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Precio costo (BOB)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  Bs.
                </span>
                <Input
                  name="costPrice"
                  type="number"
                  value={form.costPrice}
                  onChange={handleChange}
                  min={0}
                  step="0.01"
                  required
                  disabled={loading || submitting}
                  className="pl-8"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Precio mayorista (BOB)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  Bs.
                </span>
                <Input
                  name="priceWholesale"
                  type="number"
                  value={form.priceWholesale}
                  onChange={handleChange}
                  min={0}
                  step="0.01"
                  required
                  disabled={loading || submitting}
                  className="pl-8"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Precio minorista (BOB)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  Bs.
                </span>
                <Input
                  name="priceRetail"
                  type="number"
                  value={form.priceRetail}
                  onChange={handleChange}
                  min={0}
                  step="0.01"
                  required
                  disabled={loading || submitting}
                  className="pl-8"
                />
              </div>
            </div>

            {/* Discount Fields */}
            <div className="md:col-span-2 border-t pt-4">
              <div className="flex items-center space-x-2 mb-3">
                <Checkbox
                  id="hasDiscount"
                  checked={form.hasDiscount}
                  onCheckedChange={(checked) =>
                    setForm((prev) => ({
                      ...prev,
                      hasDiscount: checked as boolean,
                    }))
                  }
                  disabled={loading || submitting}
                />
                <label htmlFor="hasDiscount" className="text-sm font-medium">
                  Este producto tiene descuento
                </label>
              </div>

              {form.hasDiscount && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Descuento (%)
                    </label>
                    <Input
                      name="discountPercentage"
                      type="number"
                      value={form.discountPercentage}
                      onChange={handleChange}
                      min={0}
                      max={100}
                      step="1"
                      placeholder="Ej: 10, 20, 50"
                      disabled={loading || submitting}
                    />
                  </div>
                  {discountPrice > 0 && (
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Precio con descuento
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                          Bs.
                        </span>
                        <Input
                          type="text"
                          value={discountPrice.toFixed(2)}
                          disabled
                          className="pl-8 bg-muted"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pt-3 flex justify-end">
          <Button type="submit" disabled={loading || submitting}>
            {submitting || loading
              ? "Guardando..."
              : product
              ? "Guardar cambios"
              : "Registrar Producto"}
          </Button>
        </div>
      </form>
    </div>
  );
}
