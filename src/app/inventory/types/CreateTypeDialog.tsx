"use client";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { toast } from "sonner";

type CreateTypeDialogProps = {
  onSuccess: () => void;
};

export function CreateTypeDialog({ onSuccess }: CreateTypeDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const requestInProgress = useRef(false);

  const handleCreate = async () => {
    if (requestInProgress.current) return;
    toast.dismiss();
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error("Error", { description: "El nombre no puede estar vacío", id: "empty-name-error" });
      return;
    }
    if (trimmedName.length < 2) {
      toast.error("Error", { description: "El nombre debe tener al menos 2 caracteres", id: "invalid-length-error" });
      return;
    }
    requestInProgress.current = true;
    setLoading(true);
    try {
      const response = await fetch("/api/product-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `Error ${response.status}`);
      setName("");
      setOpen(false);
      toast.success("Tipo creado exitosamente");
      onSuccess();
    } catch (error) {
      let errorMessage = "No se pudo crear el tipo";
      if (error instanceof Error) errorMessage = error.message;
      setTimeout(() => {
        toast.error("Error", {
          description: errorMessage,
          id: "create-type-error-" + Date.now(),
          duration: 5000,
        });
      }, 100);
    } finally {
      setLoading(false);
      setTimeout(() => { requestInProgress.current = false; }, 500);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
      setName("");
      setLoading(false);
      requestInProgress.current = false;
      toast.dismiss();
    }
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleCreate();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" onClick={(e) => e.stopPropagation()}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Tipo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Tipo de Producto</DialogTitle>
            <DialogDescription>
              Ingresa el nombre del nuevo tipo de producto
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium leading-none">
              Nombre del Tipo
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Funda, Vidrio, etc."
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
              type="button"
              onClick={handleButtonClick}
              disabled={!name.trim() || loading}
            >
              {loading ? "Creando..." : "Crear Tipo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
