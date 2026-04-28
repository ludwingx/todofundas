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

const productSchema = z.object({
  phoneModelId: z.string().min(1, "El modelo es requerido"),
  typeId: z.string().min(1, "El tipo es requerido"),
  colorId: z.string().min(1, "El color es requerido"),
  materialId: z.string().optional().nullable(),
  minStock: z.coerce.number().min(0, "El stock mínimo no puede ser negativo").default(5),
  priceRetail: z.coerce.number().optional().nullable(),
  priceWholesale: z.coerce.number().optional().nullable(),
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
  const [isAnalyzingIA, setIsAnalyzingIA] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const [localPhoneModels, setLocalPhoneModels] = useState(phoneModels);
  const [localColors, setLocalColors] = useState(colors);

  const [isColorDialogOpen, setIsColorDialogOpen] = useState(false);
  const [isModelDialogOpen, setIsModelDialogOpen] = useState(false);

  const [newColor, setNewColor] = useState({ name: "", hexCode: "#000000" });
  const [newModel, setNewModel] = useState({ name: "", brandId: "" });
  const [brands, setBrands] = useState<{id: string, name: string}[]>([]);

  const [isAddingAttribute, setIsAddingAttribute] = useState(false);

  const form = useForm<any>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      phoneModelId: product?.phoneModelId || "",
      typeId: product?.typeId || "",
      colorId: product?.colorId || "",
      materialId: product?.materialId || null,
      minStock: product?.minStock ?? 5,
      priceRetail: product?.priceRetail || null,
      priceWholesale: product?.priceWholesale || null,
      hasDiscount: product?.hasDiscount || false,
      discountPercentage: product?.discountPercentage || null,
      discountPrice: product?.discountPrice || null,
      isPublic: product?.isPublic ?? false,
      publicPrice: product?.publicPrice ?? null,
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

  const analyzeIA = async () => {
    if (images.length === 0) {
      toast.error("Sube una imagen primero para analizar.");
      return;
    }

    setIsAnalyzingIA(true);
    try {
      const activeImage = images[activeImageIndex];
      let base64Data = "";

      if (activeImage.file) {
        base64Data = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(activeImage.file!);
        });
      } else {
        base64Data = activeImage.url!;
      }

      const { analyzeProductImage } = await import("@/app/actions/ai");
      const result = await analyzeProductImage(base64Data);

      if (result.success && result.data) {
        const { type, brand, model, color, hexCode, material } = result.data;
        
        toast.success("Análisis completado", {
          description: `Detectado: ${type} para ${model} (${color})`
        });

        // 1. Buscar Tipo
        if (type) {
          const searchType = type.toLowerCase();
          const foundType = productTypes.find(t => 
            t.name.toLowerCase().includes(searchType) || 
            searchType.includes("funda") && t.name.toLowerCase().includes("carcasa") ||
            searchType.includes("carcasa") && t.name.toLowerCase().includes("funda")
          );
          if (foundType) form.setValue("typeId", foundType.id, { shouldValidate: true, shouldDirty: true });
        }

        // 2. Buscar/Sugerir Modelo
        if (model) {
          const foundModel = localPhoneModels.find(m => m.name.toLowerCase().includes(model.toLowerCase()));
          if (foundModel) {
            form.setValue("phoneModelId", foundModel.id);
          } else {
            setNewModel(prev => ({ ...prev, name: model }));
            setIsModelDialogOpen(true);
            toast.info(`El modelo "${model}" es nuevo. Confirma los datos para crearlo.`);
            
            // Auto-seleccionar marca basada en el campo 'brand' de la IA o adivinar
            const autoSelectBrand = (data: any[]) => {
              let foundBrand;
              if (brand) {
                foundBrand = data.find((b: any) => brand.toLowerCase().includes(b.name.toLowerCase()) || b.name.toLowerCase().includes(brand.toLowerCase()));
              }
              if (!foundBrand) {
                foundBrand = data.find((b: any) => model.toLowerCase().includes(b.name.toLowerCase()));
              }
              if (foundBrand) setNewModel(prev => ({ ...prev, brandId: foundBrand.id }));
            };

            if (brands.length === 0) {
              fetch("/api/brands").then(r => r.json()).then(data => {
                setBrands(data);
                autoSelectBrand(data);
              });
            } else {
              autoSelectBrand(brands);
            }
          }
        }

        // 3. Buscar/Crear Automáticamente Color
        if (color && hexCode) {
          const foundColor = localColors.find(c => c.hexCode.toLowerCase() === hexCode.toLowerCase() || c.name.toLowerCase() === color.toLowerCase());
          if (foundColor) {
            form.setValue("colorId", foundColor.id);
          } else {
            try {
              const res = await fetch("/api/colors", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: color, hexCode }),
              });
              if (res.ok) {
                const created = await res.json();
                setLocalColors(prev => [...prev, created]);
                setTimeout(() => {
                  form.setValue("colorId", created.id, { shouldValidate: true, shouldDirty: true });
                }, 100);
                toast.success(`Color "${color}" creado y asignado automáticamente.`);
              }
            } catch (e) {
              setNewColor({ name: color, hexCode });
              setIsColorDialogOpen(true);
            }
          }
        }

        // 4. Buscar Material
        if (material) {
          const foundMat = materials.find(m => m.name.toLowerCase().includes(material.toLowerCase()));
          if (foundMat) form.setValue("materialId", foundMat.id);
        }
      } else {
        toast.warning("No se pudo detectar todo automáticamente. Por favor, selecciona manualmente.");
      }
    } catch (error: any) {
      console.error("AI Analysis Error:", error);
      toast.warning("El análisis automático no está disponible ahora. Puedes continuar manualmente.");
    } finally {
      setIsAnalyzingIA(false);
    }
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


  const handleQuickAddColor = async () => {
    if (!newColor.name.trim()) return;
    setIsAddingAttribute(true);
    try {
      const res = await fetch("/api/colors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newColor.name, hexCode: newColor.hexCode }),
      });
      if (res.ok) {
        const created = await res.json();
        setLocalColors((prev) => [...prev, created]);
        setTimeout(() => {
          form.setValue("colorId", created.id, { shouldValidate: true, shouldDirty: true });
        }, 100);
        setIsColorDialogOpen(false);
        toast.success("Color añadido");
      }
    } catch (error) {
      toast.error("Error al crear color");
    } finally {
      setIsAddingAttribute(false);
    }
  };

  const handleQuickAddModel = async () => {
    if (!newModel.name.trim() || !newModel.brandId) {
      toast.error("Nombre y Marca son requeridos");
      return;
    }
    setIsAddingAttribute(true);
    try {
      const res = await fetch("/api/phone-models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newModel.name, brandId: newModel.brandId }),
      });
      if (res.ok) {
        const data = await res.json();
        const createdModel = data.results?.created?.[0];
        
        if (createdModel) {
          setLocalPhoneModels((prev) => [...prev, createdModel]);
          setTimeout(() => {
            form.setValue("phoneModelId", createdModel.id, { shouldValidate: true, shouldDirty: true });
          }, 100);
        }
        setIsModelDialogOpen(false);
        toast.success("Modelo añadido");
      }
    } catch (error) {
      toast.error("Error al crear modelo");
    } finally {
      setIsAddingAttribute(false);
    }
  };

  useEffect(() => {
    if (isModelDialogOpen && brands.length === 0) {
      fetch("/api/brands").then(res => res.json()).then(setBrands);
    }
  }, [isModelDialogOpen]);

  if (!mounted) return null;

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

                  <div className="absolute bottom-4 right-4 flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      className={cn("rounded-xl shadow-lg font-bold text-[10px] uppercase tracking-wider h-10 px-4", isAnalyzingIA && "animate-pulse")}
                      onClick={analyzeIA}
                      disabled={isAnalyzingIA || images.length === 0}
                    >
                      {isAnalyzingIA ? "Analizando..." : "IA Analizar Foto"}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className={cn("rounded-xl shadow-lg font-bold text-[10px] uppercase tracking-wider h-10 px-4", isGeneratingIA && "animate-pulse")}
                      onClick={generateIAImage}
                      disabled={isGeneratingIA || !phoneModelId || !typeId}
                    >
                      {isGeneratingIA ? "Generando..." : "IA Mejorar"}
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
                          <div className="flex items-center justify-between px-1">
                            <FormLabel className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Modelo</FormLabel>
                            <Button type="button" variant="link" className="h-auto p-0 text-[10px] font-bold" onClick={() => setIsModelDialogOpen(true)}>+ Nuevo</Button>
                          </div>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-11 rounded-xl bg-background border-2 transition-all hover:border-primary/30">
                                <SelectValue placeholder="Modelo..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-xl shadow-xl">
                              {localPhoneModels.map((model) => (
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
                        const sc = localColors.find((c) => c.id === field.value);
                        return (
                          <FormItem className="space-y-1">
                          <div className="flex items-center justify-between px-1">
                            <FormLabel className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Color</FormLabel>
                            <Button type="button" variant="link" className="h-auto p-0 text-[10px] font-bold" onClick={() => setIsColorDialogOpen(true)}>+ Nuevo</Button>
                          </div>
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
                              {localColors.map((color) => (
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
                  <div className="flex items-center gap-2 text-primary border-b pb-3"><Truck className="h-5 w-5" /><h3 className="font-bold text-sm uppercase">Alertas de Stock</h3></div>
                  <div className="space-y-4">
                    <FormField control={form.control} name="minStock" render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-[10px] font-bold uppercase text-muted-foreground">Stock Mínimo (Alerta)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} className="h-12 rounded-xl text-center font-bold" onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} />
                        </FormControl>
                        <p className="text-[9px] text-muted-foreground italic px-1">Te avisaremos cuando el inventario caiga por debajo de este número.</p>
                      </FormItem>
                    )} />
                  </div>
                </Card>

                <Card className="bg-primary/[0.03] p-6 rounded-2xl space-y-6 border border-primary/10">
                  <div className="flex items-center gap-2 text-primary border-b border-primary/10 pb-3"><Banknote className="h-5 w-5" /><h3 className="font-bold text-sm uppercase">Precios de Venta (Opcional)</h3></div>
                  <div className="space-y-4 grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="priceRetail" render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-[10px] font-bold uppercase text-primary">Precio Detal (Bs)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} value={field.value || ""} className="h-12 rounded-xl font-bold text-center" onChange={(e) => field.onChange(parseFloat(e.target.value) || null)} />
                        </FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="priceWholesale" render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-[10px] font-bold uppercase text-primary">Precio Mayor (Bs)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} value={field.value || ""} className="h-12 rounded-xl font-bold text-center" onChange={(e) => field.onChange(parseFloat(e.target.value) || null)} />
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


      {/* Dialog Color */}
      <Dialog open={isColorDialogOpen} onOpenChange={setIsColorDialogOpen}>
        <DialogContent className="sm:max-w-[400px] p-8 rounded-2xl border-none shadow-2xl">
          <DialogHeader><DialogTitle className="text-xl font-bold uppercase italic text-primary">Nuevo Color</DialogTitle></DialogHeader>
          <div className="py-6 space-y-4">
            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Nombre</Label>
              <Input value={newColor.name} onChange={(e) => setNewColor(prev => ({...prev, name: e.target.value}))} placeholder="Ej: Azul Medianoche" className="h-11 rounded-xl font-bold text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Color (Hex)</Label>
              <div className="flex gap-2">
                <Input type="color" value={newColor.hexCode} onChange={(e) => setNewColor(prev => ({...prev, hexCode: e.target.value}))} className="w-12 h-11 p-1 rounded-lg" />
                <Input value={newColor.hexCode} onChange={(e) => setNewColor(prev => ({...prev, hexCode: e.target.value}))} className="flex-1 h-11 rounded-xl font-mono text-sm" />
              </div>
            </div>
          </div>
          <DialogFooter><Button type="button" onClick={handleQuickAddColor} disabled={isAddingAttribute || !newColor.name.trim()} className="w-full h-11 rounded-xl font-bold uppercase tracking-wider">Añadir Color</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Modelo */}
      <Dialog open={isModelDialogOpen} onOpenChange={setIsModelDialogOpen}>
        <DialogContent className="sm:max-w-[400px] p-8 rounded-2xl border-none shadow-2xl">
          <DialogHeader><DialogTitle className="text-xl font-bold uppercase italic text-primary">Nuevo Modelo</DialogTitle></DialogHeader>
          <div className="py-6 space-y-4">
            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Nombre del Modelo</Label>
              <Input value={newModel.name} onChange={(e) => setNewModel(prev => ({...prev, name: e.target.value}))} placeholder="Ej: iPhone 15 Pro Max" className="h-11 rounded-xl font-bold text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Marca</Label>
              <Select onValueChange={(val) => setNewModel(prev => ({...prev, brandId: val}))} value={newModel.brandId}>
                <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Elegir marca..." /></SelectTrigger>
                <SelectContent>
                  {brands.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter><Button type="button" onClick={handleQuickAddModel} disabled={isAddingAttribute || !newModel.name.trim() || !newModel.brandId} className="w-full h-11 rounded-xl font-bold uppercase tracking-wider">Añadir Modelo</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
