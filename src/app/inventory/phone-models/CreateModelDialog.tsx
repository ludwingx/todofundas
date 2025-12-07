"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";

type CreateModelDialogProps = {
  onSuccess: () => void;
};

export function CreateModelDialog({ onSuccess }: CreateModelDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [brandsLoading, setBrandsLoading] = useState(false);
  const [brands, setBrands] = useState<{ id: string; name: string; logoUrl?: string | null }[]>([]);
  const [brandId, setBrandId] = useState("");
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
        } else {
          toast.error("Error", {
            description: data.error || "No se pudieron cargar las marcas",
          });
        }
      } catch (error) {
        toast.error("Error", {
          description: "No se pudieron cargar las marcas",
        });
      } finally {
        setBrandsLoading(false);
      }
    };
    loadBrands();
  }, [open, brands.length]);

  const handleCreate = async () => {
    // Prevenir múltiples ejecuciones simultáneas
    if (requestInProgress.current) {
      return;
    }

    // Limpiar notificaciones previas
    toast.dismiss();
    
    if (!brandId) {
      toast.error("Error", {
        description: "Debes seleccionar una marca",
        id: "brand-required-error",
      });
      return;
    }

    const trimmedName = name.trim();
    
    if (!trimmedName) {
      toast.error("Error", { 
        description: "El nombre no puede estar vacío",
        id: "empty-name-error"
      });
      return;
    }
    
    if (trimmedName.length < 2) {
      toast.error("Error", {
        description: "El nombre debe tener al menos 2 caracteres",
        id: "invalid-length-error"
      });
      return;
    }
    
    requestInProgress.current = true;
    setLoading(true);
    
    try {
      console.log("Iniciando creación de modelo:", trimmedName);
      
      const response = await fetch("/api/phone-models", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: trimmedName, brandId }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `Error ${response.status}`);
      }
      
      // No mostrar toast aquí, lo manejaremos en el onSuccess del componente padre
      setName("");
      setBrandId("");
      setOpen(false);
      
      // Llamar a onSuccess sin mostrar toast aquí
      // El componente padre (PhoneModelsClient) se encargará de mostrar el mensaje
      // y actualizar la tabla
      onSuccess();
      
    } catch (error) {
      console.error("Error al crear modelo:", error);
      
      let errorMessage = "No se pudo crear el modelo";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setTimeout(() => {
        toast.error("Error", {
          description: errorMessage,
          id: "create-model-error-" + Date.now(),
          duration: 5000,
        });
      }, 100);
      
    } finally {
      setLoading(false);
      // Usar setTimeout para resetear la flag después de que todo se complete
      setTimeout(() => {
        requestInProgress.current = false;
      }, 500);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevenir propagación
    handleCreate();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      handleCreate();
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Resetear el estado cuando se cierra el diálogo
      setName("");
      setLoading(false);
      setBrandId("");
      requestInProgress.current = false;
      toast.dismiss();
    }
  };

  // Función para el botón que previene múltiples clics
  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleCreate();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" onClick={(e) => e.stopPropagation()}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Modelo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Modelo</DialogTitle>
            <DialogDescription>
              Ingresa el nombre del nuevo modelo de teléfono
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">
              Marca
            </label>
            {brandsLoading ? (
              <p className="text-sm text-muted-foreground">Cargando marcas...</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-64 overflow-y-auto pr-1">
                {brands.map((brand) => {
                  const selected = brandId === brand.id;
                  return (
                    <button
                      key={brand.id}
                      type="button"
                      onClick={() => setBrandId(brand.id)}
                      className={`text-left rounded-md border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                        selected
                          ? "border-primary ring-1 ring-primary bg-primary/5"
                          : "border-border hover:bg-muted"
                      }`}
                      disabled={loading}
                    >
                      <Card className="border-0 shadow-none bg-transparent">
                        <CardContent className="p-3 flex flex-col items-center gap-2">
                          {brand.logoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={brand.logoUrl}
                              alt={brand.name}
                              className="h-10 w-10 object-contain"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">
                              {brand.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="text-xs font-medium text-center line-clamp-2">
                            {brand.name}
                          </span>
                        </CardContent>
                      </Card>
                    </button>
                  );
                })}
                {brands.length === 0 && !brandsLoading && (
                  <p className="col-span-full text-sm text-muted-foreground">
                    No hay marcas disponibles. Crea una marca primero.
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium leading-none">
              Nombre del Modelo
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: iPhone 15 Pro Max"
              autoComplete="off"
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              type="button" // Cambiado a type="button" para evitar submit doble
              onClick={handleButtonClick}
              disabled={!name.trim() || !brandId || loading}
            >
              {loading ? "Creando..." : "Crear Modelo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}