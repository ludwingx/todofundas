"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@radix-ui/react-switch";

// Esquema de validación Zod
const productSchema = z
  .object({
    phoneModelId: z.string().min(1, "El modelo es requerido"),
    typeId: z.string().min(1, "El tipo es requerido"),
    supplierId: z.string().optional().nullable(),
    colorId: z.string().min(1, "El color es requerido"),
    materialId: z.string().optional().nullable(),
    stock: z.coerce.number().min(0, "El stock no puede ser negativo").default(0),
    minStock: z
      .coerce.number()
      .min(0, "El stock mínimo no puede ser negativo")
      .default(5),
    priceRetail: z
      .coerce.number()
      .min(0, "El precio no puede ser negativo"),
    priceWholesale: z
      .coerce.number()
      .min(0, "El precio no puede ser negativo"),
    costPrice: z
      .coerce.number()
      .min(0, "El costo no puede ser negativo"),
    hasDiscount: z.boolean().default(false),
    discountPercentage: z.coerce.number().min(0).max(100).optional().nullable(),
    discountPrice: z.coerce.number().min(0).optional().nullable(),
    image: z.instanceof(File).optional().nullable(),
  })
  .refine(
    (data) => data.priceWholesale <= data.priceRetail,
    {
      message: "El precio mayorista debe ser menor o igual al precio minorista",
      path: ["priceWholesale"],
    }
  )
  .refine(
    (data) =>
      !data.hasDiscount ||
      (data.discountPercentage !== undefined && data.discountPercentage !== null && data.discountPercentage > 0),
    {
      message: "El porcentaje de descuento es requerido cuando hay descuento",
      path: ["discountPercentage"],
    }
  );

export type ProductFormData = z.infer<typeof productSchema>;

export type ProductFormProps = {
  product?: Partial<ProductFormData>;
  productTypes: { id: string; name: string }[];
  suppliers: { id: string; name: string }[];
  phoneModels: { id: string; name: string }[];
  colors: { id: string; name: string; hexCode: string }[];
  materials: { id: string; name: string }[];
  onSubmit: (data: ProductFormData & { image?: File }) => void | Promise<void>;
  loading?: boolean;
};

export function ProductForm({
  product,
  productTypes,
  suppliers,
  phoneModels,
  colors,
  materials,
  onSubmit,
  loading,
}: ProductFormProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<any>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      phoneModelId: product?.phoneModelId || "",
      typeId: product?.typeId || "",
      supplierId: product?.supplierId || null,
      colorId: product?.colorId || (colors.length > 0 ? colors[0].id : ""),
      materialId: product?.materialId || null,
      stock: product?.stock || 0,
      minStock: product?.minStock || 5,
      priceRetail: product?.priceRetail || undefined,
      priceWholesale: product?.priceWholesale || undefined,
      costPrice: product?.costPrice || undefined,
      hasDiscount: product?.hasDiscount || false,
      discountPercentage: product?.discountPercentage || undefined,
      discountPrice: product?.discountPrice || undefined,
    },
  });

  const hasDiscount = form.watch("hasDiscount");
  const discountPercentage = form.watch("discountPercentage");
  const priceRetail = form.watch("priceRetail");

  // Calcular precio con descuento
  useEffect(() => {
    if (hasDiscount && discountPercentage && priceRetail) {
      const discountPrice = priceRetail - (priceRetail * discountPercentage) / 100;
      form.setValue("discountPrice", parseFloat(discountPrice.toFixed(2)), {
        shouldValidate: true,
      });
    } else {
      form.setValue("discountPrice", undefined);
    }
  }, [hasDiscount, discountPercentage, priceRetail, form]);

  // Manejar preview de imagen
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("image", file, { shouldValidate: true });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (data: any) => {
    setSubmitting(true);
    try {
      await onSubmit(data);
      // Si el envío fue exitoso, resetear el formulario si no es edición
      if (!product) {
        form.reset();
        setImagePreview(null);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const hasRequiredMasters =
    productTypes.length > 0 && phoneModels.length > 0 && colors.length > 0;

  if (!hasRequiredMasters) {
    return (
      <Card className="border-yellow-400">
        <CardContent className="pt-6">
          <div className="text-sm text-yellow-800">
            <p className="font-medium mb-2">
              Para registrar un producto primero debes crear al menos:
            </p>
            <ul className="list-disc list-inside space-y-1">
              {productTypes.length === 0 && <li>Al menos un Tipo de Producto</li>}
              {phoneModels.length === 0 && <li>Al menos un Modelo de Teléfono</li>}
              {colors.length === 0 && <li>Al menos un Color</li>}
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Columna de imagen */}
            <div className="md:col-span-1 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Imagen del producto</label>
                <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-muted-foreground/25 rounded-lg hover:border-muted-foreground/50 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-48 h-48 object-contain rounded-lg mb-2"
                      />
                    ) : (
                      <div className="w-48 h-48 flex items-center justify-center bg-muted rounded-lg mb-2">
                        <span className="text-muted-foreground">Click para subir imagen</span>
                      </div>
                    )}
                    <Button type="button" variant="outline" size="sm">
                      {imagePreview ? "Cambiar imagen" : "Subir imagen"}
                    </Button>
                  </label>
                </div>
                <FormDescription>
                  Recomendado: 500x500px, formato JPG o PNG
                </FormDescription>
                {form.formState.errors.image && (
                  <p className="text-xs font-medium text-destructive">
                    {String(form.formState.errors.image.message || "")}
                  </p>
                )}
              </div>
            </div>

            {/* Columna de campos */}
            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Modelo */}
                <FormField
                  control={form.control}
                  name="phoneModelId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Modelo *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar modelo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {phoneModels.map((model) => (
                            <SelectItem key={model.id} value={model.id}>
                              {model.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Tipo */}
                <FormField
                  control={form.control}
                  name="typeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {productTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Color */}
                <FormField
                  control={form.control}
                  name="colorId"
                  render={({ field }) => {
                    const selectedColor = colors.find(c => c.id === field.value);
                    return (
                      <FormItem>
                        <FormLabel>Color *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-4 h-4 rounded-full border"
                                  style={{ backgroundColor: selectedColor?.hexCode || "#ccc" }}
                                />
                                <span>{selectedColor?.name || "Seleccionar color"}</span>
                              </div>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {colors.map((color) => (
                              <SelectItem key={color.id} value={color.id}>
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-4 h-4 rounded-full border"
                                    style={{ backgroundColor: color.hexCode }}
                                  />
                                  <span>{color.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                {/* Material */}
                <FormField
                  control={form.control}
                  name="materialId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Material</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value || ""}
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sin material" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">Sin material</SelectItem>
                          {materials.map((material) => (
                            <SelectItem key={material.id} value={material.id}>
                              {material.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Proveedor */}
                <FormField
                  control={form.control}
                  name="supplierId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Proveedor</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value || ""}
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sin proveedor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">Sin proveedor</SelectItem>
                          {suppliers.map((supplier) => (
                            <SelectItem key={supplier.id} value={supplier.id}>
                              {supplier.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Stock */}
                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Stock Mínimo */}
                <FormField
                  control={form.control}
                  name="minStock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock Mínimo</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        Alerta cuando el stock esté por debajo de este número
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Precios */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                <FormField
                  control={form.control}
                  name="costPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Costo (BOB) *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm">
                            Bs.
                          </span>
                          <Input
                            type="number"
                            min={0}
                            step="0.01"
                            className="pl-10"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priceWholesale"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Precio Mayorista (BOB) *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm">
                            Bs.
                          </span>
                          <Input
                            type="number"
                            min={0}
                            step="0.01"
                            className="pl-10"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priceRetail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Precio Minorista (BOB) *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm">
                            Bs.
                          </span>
                          <Input
                            type="number"
                            min={0}
                            step="0.01"
                            className="pl-10"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Descuento */}
              <div className="pt-4 border-t">
                <FormField
                  control={form.control}
                  name="hasDiscount"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Aplicar descuento</FormLabel>
                        <FormDescription>
                          Activar para ofrecer este producto con descuento
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {hasDiscount && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <FormField
                      control={form.control}
                      name="discountPercentage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Porcentaje de descuento (%)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              max={100}
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="discountPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Precio con descuento</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm">
                                Bs.
                              </span>
                              <Input
                                className="pl-10 bg-muted"
                                readOnly
                                value={field.value?.toFixed(2) || ""}
                              />
                            </div>
                          </FormControl>
                          <FormDescription>
                            Precio calculado automáticamente
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t">
            <Button
              type="submit"
              disabled={submitting || loading || !form.formState.isValid}
              className="min-w-[200px]"
            >
              {(submitting || loading) ? (
                <>
                  <span className="animate-spin mr-2">⟳</span>
                  Guardando...
                </>
              ) : product ? (
                "Guardar cambios"
              ) : (
                "Registrar Producto"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}