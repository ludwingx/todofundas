"use client";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type CreateCompatibilityDialogProps = {
  onSuccess: () => void;
};

export function CreateCompatibilityDialog({
  onSuccess,
}: CreateCompatibilityDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [deviceType, setDeviceType] = useState("Smartphone");
  const [loading, setLoading] = useState(false);
  const requestInProgress = useRef(false);

  const handleCreate = async () => {
    if (requestInProgress.current) return;
    toast.dismiss();
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error("Error", {
        description: "El nombre no puede estar vacío",
        id: "empty-name-error",
      });
      return;
    }
    if (trimmedName.length < 2) {
      toast.error("Error", {
        description: "El nombre debe tener al menos 2 caracteres",
        id: "invalid-length-error",
      });
      return;
    }
    requestInProgress.current = true;
    setLoading(true);
    try {
      const response = await fetch("/api/compatibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName, deviceType }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || `Error ${response.status}`);
      setName("");
      setDeviceType("Smartphone");
      setOpen(false);
      toast.success("Compatibilidad creada exitosamente");
      onSuccess();
    } catch (error) {
      let errorMessage = "No se pudo crear la compatibilidad";
      if (error instanceof Error) errorMessage = error.message;
      setTimeout(() => {
        toast.error("Error", {
          description: errorMessage,
          id: "create-comp-error-" + Date.now(),
          duration: 5000,
        });
      }, 100);
    } finally {
      setLoading(false);
      setTimeout(() => {
        requestInProgress.current = false;
      }, 500);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleCreate();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      handleCreate();
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setName("");
      setDeviceType("Smartphone");
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
          Nueva Compatibilidad
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Crear Nueva Compatibilidad</DialogTitle>
            <DialogDescription>
              Ingresa el nombre y tipo de dispositivo compatible
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium leading-none">
              Nombre
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: iPhone 14, Samsung S23, etc."
              autoComplete="off"
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="type" className="text-sm font-medium leading-none">
              Tipo de Dispositivo
            </label>
            <Select
              value={deviceType}
              onValueChange={setDeviceType}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Smartphone">Smartphone</SelectItem>
                <SelectItem value="Tablet">Tablet</SelectItem>
                <SelectItem value="Laptop">Laptop</SelectItem>
                <SelectItem value="Smartwatch">Smartwatch</SelectItem>
                <SelectItem value="Otro">Otro</SelectItem>
              </SelectContent>
            </Select>
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
              {loading ? "Creando..." : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
