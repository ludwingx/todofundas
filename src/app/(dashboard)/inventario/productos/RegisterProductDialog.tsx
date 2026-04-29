"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import NewProductClient from "./NewProductClient";

interface RegisterProductDialogProps {
  productTypes: any[];
  phoneModels: any[];
  colors: any[];
  materials: any[];
  compatibilities: any[];
}

export function RegisterProductDialog({
  productTypes,
  phoneModels,
  colors,
  materials,
  compatibilities,
}: RegisterProductDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button 
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 transition-transform active:scale-95"
      >
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">Registrar Producto</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-4xl p-6 overflow-hidden flex flex-col max-h-[90vh] rounded-[2rem] border-none shadow-2xl">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-lg font-semibold">
              Registrar Producto
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-1">
            <NewProductClient
              productTypes={productTypes}
              phoneModels={phoneModels}
              colors={colors}
              materials={materials}
              compatibilities={compatibilities}
              onSuccess={() => setOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
