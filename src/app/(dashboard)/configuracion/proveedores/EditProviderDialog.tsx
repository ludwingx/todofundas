"use client";

import { useState } from "react";
import { Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import EditProviderClient from "./EditProviderClient";

interface EditProviderDialogProps {
  provider: any;
}

export function EditProviderDialog({ provider }: EditProviderDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="Editar" className="group">
          <Edit className="h-4 w-4 text-slate-600 group-hover:text-blue-600 transition-colors" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg p-4 overflow-hidden flex flex-col max-h-[95vh]">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-lg font-semibold">Editar Proveedor</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto pr-1">
          <EditProviderClient 
            provider={provider} 
            onSuccess={() => setOpen(false)} 
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
