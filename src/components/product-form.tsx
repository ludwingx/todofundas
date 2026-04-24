"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Smartphone,
  Palette,
  Layers,
  Truck,
  Hash,
  AlertTriangle,
  Banknote,
  Tags,
  Image as ImageIcon,
  CheckCircle2,
  Package,
  Info,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Trash2,
  Star,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";

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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Esquema de validación Zod
const productSchema = z.object({
  phoneModelId: z.string().min(1, "El modelo es requerido"),
  typeId: z.string().min(1, "El tipo es requerido"),
  supplierId: z.string().optional().nullable(),
  colorId: z.string().min(1, "El color es requerido"),
  materialId: z.string().optional().nullable(),
  stock: z.coerce.number().min(0, "El stock no puede ser negativo").default(0),
  stockDamaged: z.coerce.number().min(0, "El stock dañado no puede ser negativo").default(0),
  minStock: z.coerce.number().min(0, "El stock mínimo no puede ser negativo").default(5),
  priceRetail: z.coerce.number().optional().nullable(),
  priceWholesale: z.coerce.number().optional().nullable(),
  costPrice: z.coerce.number().min(0, "El costo no puede ser negativo"),
  hasDiscount: z.boolean().default(false),
  discountPercentage: z.coerce.number().optional().nullable(),
  discountPrice: z.coerce.number().optional().nullable(),
  isPublic: z.boolean().default(false),
  publicPrice: z.coerce.number().optional().nullable(),
});

export type ProductFormData = z.infer<typeof productSchema>;

interface ProductImage {
  file?: File;
  url?: string;
  preview: string;
  isCover: boolean;
  id: string;
}

export type ProductFormProps = {
  product?: Partial<ProductFormData & { images?: any[] }>;
  productTypes: { id: string; name: string }[];
  suppliers: { id: string; name: string }[];
  phoneModels: { id: string; name: string; brand?: { name: string } }[];
  colors: { id: string; name: string; hexCode: string }[];
  materials: { id: string; name: string }[];
  compatibilities: { id: string; name: string; deviceType: string }[];
  onSubmit: (data: ProductFormData & { 
    images: File[], 
    existingImages: { id: string, url: string }[],
    coverIndex: number 
  }) => void | Promise<void>;
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
  const [currentStep, setCurrentStep] = useState(1);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isGeneratingIA, setIsGeneratingIA] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localSuppliers, setLocalSuppliers] = useState(suppliers);
  const [isAddingSupplier, setIsAddingSupplier] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState("");
  const [isSupplierDialogOpen, setIsSupplierDialogOpen] = useState(false);

  const form = useForm<any>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      phoneModelId: product?.phoneModelId || "",
      typeId: product?.typeId || "",
      supplierId: product?.supplierId || null,
      colorId: product?.colorId || (colors.length > 0 ? colors[0].id : ""),
      materialId: product?.materialId || null,
      stock: product?.stock ?? 0,
      stockDamaged: product?.stockDamaged ?? 0,
      minStock: product?.minStock ?? 5,
      priceRetail: product?.priceRetail || 0,
      priceWholesale: product?.priceWholesale || 0,
      costPrice: product?.costPrice || 0,
      hasDiscount: product?.hasDiscount || false,
      discountPercentage: product?.discountPercentage || 0,
      discountPrice: product?.discountPrice || 0,
      isPublic: (product as any)?.isPublic ?? false,
      publicPrice: (product as any)?.publicPrice ?? null,
    },
  });

  const phoneModelId = form.watch("phoneModelId");
  const typeId = form.watch("typeId");
  const colorId = form.watch("colorId");
  const materialId = form.watch("materialId");

  const selectedModel = phoneModels.find(m => m.id === phoneModelId);
  const selectedType = productTypes.find(t => t.id === typeId);
  const selectedColor = colors.find(c => c.id === colorId);

  useEffect(() => {
    if (product?.images && product.images.length > 0) {
      setImages(product.images.map((img: any) => ({
        id: img.id,
        url: img.url,
        preview: img.url,
        isCover: img.isCover
      })));
    }
  }, [product]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newImages: ProductImage[] = Array.from(files).map(file => ({
        id: Math.random().toString(36).substring(7),
        file,
        preview: URL.createObjectURL(file),
        isCover: images.length === 0
      }));
      setImages(prev => [...prev, ...newImages]);
      setActiveImageIndex(images.length);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const newImages = [...prev];
      const removed = newImages.splice(index, 1)[0];
      if (removed.isCover && newImages.length > 0) {
        newImages[0].isCover = true;
      }
      return newImages;
    });
    if (activeImageIndex >= images.length - 1) {
      setActiveImageIndex(Math.max(0, images.length - 2));
    }
  };

  const setAsCover = (index: number) => {
    setImages(prev => prev.map((img, i) => ({
      ...img,
      isCover: i === index
    })));
  };

  const generateIAImage = async () => {
    if (!selectedModel || !selectedType || !selectedColor) {
      toast.error("Selecciona modelo, tipo y color para la IA.");
      return;
    }

    setIsGeneratingIA(true);
    try {
      const referenceImage = images.length > 0 ? images[0] : null;
      let base64Data = "";

      if (referenceImage?.file) {
        base64Data = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(referenceImage.file!);
        });
      } else {
        toast.error("Sube una imagen primero para usar como referencia.");
        return;
      }

      const prompt = `Professional product photography of a ${selectedColor.name} ${selectedType.name} for ${selectedModel.name}. Front view, centered, solid white background, high resolution.`;
      
      toast.info("Generando con IA Real...", {
        description: "Enviando imagen a Gemini 2.0 Flash..."
      });

      const { improveProductImage } = await import("@/app/actions/ai");
      const result = await improveProductImage(base64Data, prompt);

      if (!result.success || !result.data) {
        throw new Error(result.error || "Error en la generación");
      }
      
      const newImage: ProductImage = {
        id: Math.random().toString(36).substring(7),
        preview: result.data, 
        isCover: false
      };
      
      setImages(prev => {
        const next = [...prev, newImage];
        setActiveImageIndex(next.length - 1);
        return next;
      });
      
      toast.success(`${selectedType.name} generado con éxito`);
    } catch (error: any) {
      console.error("Error generating AI image:", error);
      toast.error("Error con la IA: " + (error.message || "Intenta de nuevo"));
    } finally {
      setIsGeneratingIA(false);
    }
  };

  const handleSubmit = async (data: any) => {
    if (images.length === 0) {
      toast.error("Añade al menos una imagen.");
      return;
    }

    setSubmitting(true);
    try {
      const coverIndex = images.findIndex(img => img.isCover);
      const imageFiles = images.filter(img => img.file).map(img => img.file as File);
      const existingImages = images.filter(img => !img.file).map(img => ({ id: img.id, url: img.url as string }));
      
      await onSubmit({ 
        ...data, 
        images: imageFiles, 
        existingImages,
        coverIndex: coverIndex === -1 ? 0 : coverIndex 
      });
      
      if (!product) {
        form.reset();
        setImages([]);
        setCurrentStep(1);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickAddSupplier = async () => {
    if (!newSupplierName.trim()) return;
    setIsAddingSupplier(true);
    try {
      const res = await fetch("/api/providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newSupplierName }),
      });
      if (res.ok) {
        const created = await res.json();
        setLocalSuppliers((prev) => [created, ...prev]);
        form.setValue("supplierId", created.id);
        setNewSupplierName("");
        setIsSupplierDialogOpen(false);
        toast.success("Proveedor añadido");
      }
    } catch (error) {
      console.error("Error creating supplier:", error);
    } finally {
      setIsAddingSupplier(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-2">
      <div className="flex items-center justify-center mb-8 gap-4">
        {[1, 2].map((s) => (
          <React.Fragment key={s}>
            <div className={cn(
              "flex items-center gap-2 px-5 py-2 rounded-full border transition-all duration-300",
              currentStep === s ? "bg-primary text-white border-primary shadow-md" : "bg-muted/50 text-muted-foreground border-transparent"
            )}>
              <span className={cn("h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold", currentStep === s ? "bg-white text-primary" : "bg-muted-foreground/30")}>{s}</span>
              <span className="text-xs font-bold uppercase tracking-wider">{s === 1 ? "Identificación" : "Logística"}</span>
            </div>
            {s === 1 && <div className="h-px w-8 bg-muted" />}
          </React.Fragment>
        ))}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {currentStep === 1 ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-500">
              <div className="lg:col-span-7 space-y-4">
                <Card className="overflow-hidden border-2 border-dashed border-muted bg-muted/5 relative min-h-[400px] flex flex-col items-center justify-center rounded-2xl group">
                  <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" id="image-upload" />
                  
                  {images.length > 0 ? (
                    <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
                      <div className="relative w-full aspect-square max-h-[320px] flex items-center justify-center">
                        <img 
                          src={images[activeImageIndex].preview} 
                          alt="Preview" 
                          className="max-w-full max-h-full object-contain drop-shadow-lg transition-transform duration-500 group-hover:scale-105" 
                        />
                        
                        {images.length > 1 && (
                          <>
                            <Button type="button" variant="ghost" size="icon" className="absolute left-0 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full hover:bg-background/80" onClick={() => setActiveImageIndex(prev => (prev > 0 ? prev - 1 : images.length - 1))}><ChevronLeft /></Button>
                            <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full hover:bg-background/80" onClick={() => setActiveImageIndex(prev => (prev < images.length - 1 ? prev + 1 : 0))}><ChevronRight /></Button>
                          </>
                        )}
                      </div>

                      <div className="mt-4 flex items-center gap-2 max-w-full overflow-x-auto pb-2 scrollbar-hide">
                        {images.map((img, i) => (
                          <button
                            key={img.id}
                            type="button"
                            onClick={() => setActiveImageIndex(i)}
                            className={cn(
                              "relative h-14 w-14 rounded-lg overflow-hidden shrink-0 border-2",
                              activeImageIndex === i ? "border-primary" : "border-transparent opacity-60"
                            )}
                          >
                            <img src={img.preview} alt="" className="h-full w-full object-cover" />
                          </button>
                        ))}
                        <button type="button" onClick={() => document.getElementById('image-upload')?.click()} className="h-14 w-14 rounded-lg border-2 border-dashed border-primary/20 flex items-center justify-center text-primary/40 hover:text-primary transition-all shrink-0"><Plus /></button>
                      </div>
                    </div>
                  ) : (
                    <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center justify-center w-full h-full p-8 text-center space-y-4">
                      <div className="h-20 w-20 rounded-2xl bg-primary/5 flex items-center justify-center"><ImageIcon className="h-8 w-8 text-primary/40" /></div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-lg">Carga de Imágenes</h4>
                        <p className="text-xs text-muted-foreground max-w-[240px]">Sube fotos reales o genera con IA</p>
                      </div>
                      <Button type="button" variant="outline" size="sm" className="rounded-full px-6">Seleccionar</Button>
                    </label>
                  )}

                  {images.length > 0 && (
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button type="button" variant="destructive" size="icon" className="h-8 w-8 rounded-lg shadow-lg" onClick={() => removeImage(activeImageIndex)}><Trash2 className="h-4 w-4" /></Button>
                      <Button type="button" variant="secondary" size="icon" className={cn("h-8 w-8 rounded-lg shadow-lg", images[activeImageIndex].isCover && "text-yellow-500")} onClick={() => setAsCover(activeImageIndex)}><Star className="h-4 w-4 fill-current" /></Button>
                    </div>
                  )}

                  <div className="absolute bottom-4 right-4">
                    <Button
                      type="button"
                      size="sm"
                      className={cn("rounded-xl shadow-lg font-bold text-[10px] uppercase tracking-wider h-10 px-6", isGeneratingIA && "animate-pulse")}
                      onClick={generateIAImage}
                      disabled={isGeneratingIA || !phoneModelId || !typeId}
                    >
                      {isGeneratingIA ? "Generando..." : "IA Generar"}
                    </Button>
                  </div>
                </Card>
              </div>

              <div className="lg:col-span-5 space-y-6">
                <div className="flex items-center gap-3 text-primary">
                  <Smartphone className="h-5 w-5" />
                  <h3 className="font-bold text-lg uppercase tracking-tight">Atributos</h3>
                </div>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="phoneModelId"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Modelo</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11 rounded-xl bg-background border-2 transition-all hover:border-primary/30">
                              <SelectValue placeholder="Modelo..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-xl shadow-xl">
                            {phoneModels.map((model) => (
                              <SelectItem key={model.id} value={model.id} className="h-10 text-sm">
                                {model.name} <span className="text-[10px] opacity-40 ml-2">({model.brand?.name})</span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="typeId"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Tipo</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11 rounded-xl bg-background border-2">
                              <SelectValue placeholder="Categoría..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-xl shadow-xl">
                            {productTypes.map((type) => (
                              <SelectItem key={type.id} value={type.id} className="h-10 text-sm">{type.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="colorId"
                      render={({ field }) => {
                        const sc = colors.find((c) => c.id === field.value);
                        return (
                          <FormItem className="space-y-1">
                            <FormLabel className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Color</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-11 rounded-xl bg-background border-2 px-3">
                                  <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: sc?.hexCode || "transparent" }} />
                                    <span className="text-xs truncate">{sc?.name || "Ver"}</span>
                                  </div>
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="rounded-xl">
                                {colors.map((color) => (
                                  <SelectItem key={color.id} value={color.id} className="h-10">
                                    <div className="flex items-center gap-2">
                                      <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: color.hexCode }} />
                                      <span className="text-xs">{color.name}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        );
                      }}
                    />

                    <FormField
                      control={form.control}
                      name="materialId"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Material</FormLabel>
                          <Select onValueChange={(val) => field.onChange(val === "unselected" ? null : val)} value={field.value || "unselected"}>
                            <FormControl>
                              <SelectTrigger className="h-11 rounded-xl bg-background border-2 px-3 text-xs">
                                <SelectValue placeholder="Elegir..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-xl">
                              <SelectItem value="unselected" className="opacity-40 text-xs italic">Opcional</SelectItem>
                              {materials.map((m) => (
                                <SelectItem key={m.id} value={m.id} className="h-10 text-xs">{m.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <Button type="button" className="w-full rounded-xl h-12 font-bold uppercase tracking-widest shadow-lg" onClick={() => setCurrentStep(2)} disabled={!phoneModelId || !typeId || !colorId}>Siguiente <ArrowRight className="ml-2 h-4 w-4" /></Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-muted/10 p-6 rounded-2xl space-y-6">
                  <div className="flex items-center gap-2 text-primary border-b pb-3"><Truck className="h-5 w-5" /><h3 className="font-bold text-sm uppercase">Stock</h3></div>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="supplierId"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <div className="flex items-center justify-between px-1">
                            <FormLabel className="text-[10px] font-bold uppercase text-muted-foreground">Proveedor</FormLabel>
                            <Button type="button" variant="link" className="h-auto p-0 text-[10px] font-bold" onClick={() => setIsSupplierDialogOpen(true)}>+ Añadir</Button>
                          </div>
                          <Select onValueChange={(val) => field.onChange(val === "unselected" ? null : val)} value={field.value || "unselected"}>
                            <FormControl><SelectTrigger className="h-11 rounded-xl border-2"><SelectValue placeholder="Seleccionar..." /></SelectTrigger></FormControl>
                            <SelectContent className="rounded-xl">
                              <SelectItem value="unselected" className="opacity-40 italic">Ninguno</SelectItem>
                              {localSuppliers.map((s) => (<SelectItem key={s.id} value={s.id} className="text-sm">{s.name}</SelectItem>))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="stock" render={({ field }) => (
                          <FormItem className="space-y-1">
                            <FormLabel className="text-[10px] font-bold uppercase text-primary">Unidades Nuevas</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} className="h-12 rounded-xl text-center font-bold text-lg border-primary/20" onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} />
                            </FormControl>
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="stockDamaged" render={({ field }) => (
                          <FormItem className="space-y-1">
                            <FormLabel className="text-[10px] font-bold uppercase text-orange-600">Unidades Dañadas</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} className="h-12 rounded-xl text-center font-bold text-lg border-orange-200 bg-orange-50/30" onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} />
                            </FormControl>
                          </FormItem>
                        )} />
                      </div>
                      <FormField control={form.control} name="minStock" render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-[10px] font-bold uppercase text-muted-foreground">Alerta Stock Mínimo</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} className="h-10 rounded-lg text-center" onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} />
                          </FormControl>
                        </FormItem>
                      )} />
                    </div>
                  </div>
                </Card>

                <Card className="bg-primary/[0.03] p-6 rounded-2xl space-y-6 border border-primary/10">
                  <div className="flex items-center gap-2 text-primary border-b border-primary/10 pb-3"><Banknote className="h-5 w-5" /><h3 className="font-bold text-sm uppercase">Costos e Inventario Interno</h3></div>
                  <div className="space-y-4">
                    <FormField control={form.control} name="costPrice" render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-[10px] font-bold uppercase text-primary">Costo del Producto (Bs)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type="number" 
                              step="0.01" 
                              {...field} 
                              className="h-12 rounded-xl font-bold text-lg pr-12" 
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} 
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">Bs</span>
                          </div>
                        </FormControl>
                      </FormItem>
                    )} />
                  </div>
                </Card>

                {/* NUEVA SECCIÓN: CATÁLOGO WEB PÚBLICO */}
                <Card className="bg-blue-500/[0.03] p-6 rounded-2xl space-y-6 border border-blue-500/10">
                  <div className="flex items-center justify-between border-b border-blue-500/10 pb-3">
                    <div className="flex items-center gap-2 text-blue-600">
                      <Sparkles className="h-5 w-5" />
                      <h3 className="font-bold text-sm uppercase">Catálogo Web</h3>
                    </div>
                    <FormField
                      control={form.control}
                      name="isPublic"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2 space-y-0">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="data-[state=checked]:bg-blue-600"
                            />
                          </FormControl>
                          <FormLabel className="text-[10px] font-bold uppercase cursor-pointer">Publicar</FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className={cn("space-y-4 transition-all duration-300", form.watch("isPublic") ? "opacity-100" : "opacity-40 grayscale pointer-events-none")}>
                    <FormField control={form.control} name="publicPrice" render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-[10px] font-bold uppercase text-blue-600">Precio Público (Catálogo)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type="number" 
                              step="0.01" 
                              {...field} 
                              value={field.value || ""}
                              placeholder="Ej: 45.00"
                              className="h-12 rounded-xl font-bold text-lg pr-12 border-blue-200 focus-visible:ring-blue-500" 
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || null)} 
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-blue-600/50">Bs</span>
                          </div>
                        </FormControl>
                        <p className="text-[9px] text-muted-foreground italic px-1">Este precio solo se verá en la web pública para clientes.</p>
                      </FormItem>
                    )} />
                  </div>
                </Card>
              </div>

              <div className="flex items-center justify-between pt-6">
                <Button type="button" variant="ghost" className="rounded-xl h-12 px-8 font-bold text-xs" onClick={() => setCurrentStep(1)}><ArrowLeft className="mr-2 h-4 w-4" /> Volver</Button>
                <Button type="submit" disabled={submitting || loading} className="rounded-xl h-12 px-12 font-bold uppercase tracking-wider shadow-lg bg-primary text-white">{submitting ? "Guardando..." : "Finalizar"}</Button>
              </div>
            </div>
          )}
        </form>
      </Form>

      {/* Dialog Proveedor Compacto */}
      <Dialog open={isSupplierDialogOpen} onOpenChange={setIsSupplierDialogOpen}>
        <DialogContent className="sm:max-w-[400px] p-8 rounded-2xl border-none shadow-2xl">
          <DialogHeader><DialogTitle className="text-xl font-bold uppercase italic text-primary">Nuevo Proveedor</DialogTitle></DialogHeader>
          <div className="py-6 space-y-4">
            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Nombre</Label>
              <Input value={newSupplierName} onChange={(e) => setNewSupplierName(e.target.value)} placeholder="Ej: Mayorista X" className="h-11 rounded-xl font-bold text-sm" />
            </div>
          </div>
          <DialogFooter><Button type="button" onClick={handleQuickAddSupplier} disabled={isAddingSupplier || !newSupplierName.trim()} className="w-full h-11 rounded-xl font-bold uppercase tracking-wider">Confirmar</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
