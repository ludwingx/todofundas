"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Edit } from "lucide-react";
import EditProductClient from "./EditProductClient";

export default function ProductEditDialog({
  product,
  productTypes,
  suppliers,
  phoneModels,
}: {
  product: any;
  productTypes: { id: string; name: string }[];
  suppliers: { id: string; name: string }[];
  phoneModels: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl p-4">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-lg font-semibold">Editar Producto</DialogTitle>
        </DialogHeader>
        <EditProductClient
          product={product}
          productTypes={productTypes}
          suppliers={suppliers}
          phoneModels={phoneModels}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
