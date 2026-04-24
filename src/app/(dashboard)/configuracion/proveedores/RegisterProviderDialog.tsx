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
import NewProviderClient from "./NewProviderClient";

export function RegisterProviderDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="px-4 py-2 rounded bg-primary text-primary-foreground font-semibold shadow hover:bg-primary/90 hover:text-white transition text-sm flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> 
          <span>Nuevo Proveedor</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg p-4 overflow-hidden flex flex-col max-h-[95vh]">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-lg font-semibold">Nuevo Proveedor</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto pr-1">
          <NewProviderClient onSuccess={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
