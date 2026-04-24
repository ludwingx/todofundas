"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, X, Sparkles, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type CreateModelDialogProps = {
  onSuccess: () => void;
};

export function CreateModelDialog({ onSuccess }: CreateModelDialogProps) {
  const [open, setOpen] = useState(false);
  const [currentName, setCurrentName] = useState("");
  const [modelNames, setModelNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [brandsLoading, setBrandsLoading] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [suggestCount, setSuggestCount] = useState(5);
  const [brands, setBrands] = useState<{ id: string; name: string; logoUrl?: string | null }[]>([]);
  const [brandId, setBrandId] = useState("");
  const [step, setStep] = useState<1 | 2>(1);
  const requestInProgress = useRef(false);

  useEffect(() => {
    if (!open) return;
    if (brands.length > 0) return;
    const loadBrands = async () => {
      try {
        setBrandsLoading(true);
        const res = await fetch("/api/brands", { cache: "no-store" });
        const data = await res.json();
        if (Array.isArray(data)) {
          setBrands(data);
        }
      } catch (error) {
        toast.error("Error al cargar marcas");
      } finally {
        setBrandsLoading(false);
      }
    };
    loadBrands();
  }, [open, brands.length]);

  const addModelName = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (modelNames.some(n => n.toLowerCase() === trimmed.toLowerCase())) {
      toast.error("Este modelo ya está en la lista");
      return;
    }
    setModelNames(prev => [...prev, trimmed]);
    setCurrentName("");
  };

  const removeModelName = (index: number) => {
    setModelNames(prev => prev.filter((_, i) => i !== index));
  };

  const suggestFromAI = async () => {
    const selectedBrand = brands.find(b => b.id === brandId);
    if (!selectedBrand) return;

    try {
      setSuggesting(true);
      const res = await fetch("/api/ai/suggest-models", {
        method: "POST",
        body: JSON.stringify({
          brandName: selectedBrand.name,
          existingModels: modelNames,
          count: suggestCount
        })
      });
      const data = await res.json();
      
      if (data.suggestedModels && Array.isArray(data.suggestedModels)) {
        const newModels = data.suggestedModels.filter(
          (m: string) => !modelNames.some(existing => existing.toLowerCase() === m.toLowerCase())
        );
        setModelNames(prev => [...prev, ...newModels]);
        toast.success(`Se añadieron ${newModels.length} sugerencias`);
      } else if (data.error) {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast.error("Error al obtener sugerencias: " + error.message);
    } finally {
      setSuggesting(false);
    }
  };

  const handleCreate = async () => {
    if (requestInProgress.current || (modelNames.length === 0 && !currentName.trim())) return;

    let finalNames = [...modelNames];
    if (currentName.trim()) {
      const trimmed = currentName.trim();
      if (!finalNames.some(n => n.toLowerCase() === trimmed.toLowerCase())) {
        finalNames.push(trimmed);
      }
    }

    requestInProgress.current = true;
    setLoading(true);
    
    try {
      const response = await fetch("/api/phone-models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ names: finalNames, brandId }),
      });
      
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || "Error al crear modelos");
      
      toast.success(data.message || "Modelos creados exitosamente");
      setModelNames([]);
      setCurrentName("");
      setBrandId("");
      setOpen(false);
      onSuccess();
      
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
      requestInProgress.current = false;
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setModelNames([]);
      setCurrentName("");
      setBrandId("");
      setStep(1);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button">
          <Plus className="h-4 w-4 mr-2" />
          Nuevos Modelos
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] gap-0 p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Crear Modelos</DialogTitle>
          <DialogDescription>
            {step === 1 ? "Selecciona la marca." : "Añade los modelos para la marca seleccionada."}
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 pt-2 space-y-6">
          {step === 1 ? (
            <div className="flex flex-wrap justify-center gap-3 max-h-80 overflow-y-auto py-2 pr-1">
              {brandsLoading ? (
                <div className="flex flex-col items-center py-10 gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
                  <p className="text-sm text-muted-foreground">Cargando marcas...</p>
                </div>
              ) : (
                brands.map((brand) => (
                  <button
                    key={brand.id}
                    type="button"
                    onClick={() => {
                      setBrandId(brand.id);
                      setStep(2);
                    }}
                    className={cn(
                      "w-[100px] text-center rounded-xl border p-3 transition-all hover:scale-105",
                      brandId === brand.id ? "border-primary ring-2 ring-primary/20 bg-primary/5" : "border-border hover:bg-muted"
                    )}
                  >
                    <div className="h-10 w-10 mx-auto flex items-center justify-center mb-2">
                      {brand.logoUrl ? (
                        <img src={brand.logoUrl} alt={brand.name} className="h-full w-full object-contain" />
                      ) : (
                        <div className="h-full w-full rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                          {brand.name.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-tight line-clamp-2">{brand.name}</span>
                  </button>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-muted/30 rounded-lg p-3 border border-dashed">
                <div className="flex items-center gap-3">
                  {brands.find(b => b.id === brandId)?.logoUrl && (
                    <img src={brands.find(b => b.id === brandId)?.logoUrl!} className="h-8 w-8 object-contain" alt="" />
                  )}
                  <span className="font-bold text-sm uppercase">{brands.find(b => b.id === brandId)?.name}</span>
                </div>
                <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold" onClick={() => setStep(1)}>CAMBIAR MARCA</Button>
              </div>

              <div className="flex gap-2">
                <Input
                  value={currentName}
                  onChange={(e) => setCurrentName(e.target.value)}
                  placeholder="Nombre del modelo..."
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addModelName(currentName))}
                  className="flex-1"
                />
                <Button type="button" variant="secondary" onClick={() => addModelName(currentName)}>
                  Añadir
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  LISTA DE MODELOS ({modelNames.length})
                </span>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    value={suggestCount}
                    onChange={(e) => setSuggestCount(parseInt(e.target.value) || 1)}
                    className="w-14 h-8 text-center text-xs px-1"
                    title="Cantidad de modelos a sugerir"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="h-8 gap-2 text-primary hover:text-primary hover:bg-primary/5"
                    onClick={suggestFromAI}
                    disabled={suggesting}
                  >
                    {suggesting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                    Sugerir con AI
                  </Button>
                </div>
              </div>

              <div className="min-h-[150px] max-h-[250px] overflow-y-auto border rounded-lg p-3 bg-muted/10">
                {modelNames.length === 0 ? (
                  <div className="h-32 flex flex-col items-center justify-center text-muted-foreground gap-2">
                    <Plus className="h-8 w-8 opacity-20" />
                    <p className="text-xs">No hay modelos añadidos todavía</p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {modelNames.map((name, i) => (
                      <Badge key={i} variant="secondary" className="pl-3 pr-1 py-1 gap-2 border hover:border-destructive/50 transition-colors group">
                        {name}
                        <button 
                          onClick={() => removeModelName(i)}
                          className="hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="p-6 pt-2 border-t bg-muted/20">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancelar</Button>
          {step === 2 && (
            <Button onClick={handleCreate} disabled={loading || (modelNames.length === 0 && !currentName.trim())}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              {loading ? "Creando..." : `Crear ${modelNames.length + (currentName.trim() ? 1 : 0)} Modelos`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}