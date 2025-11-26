"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Edit } from "lucide-react";
import EditProductClient from "./EditProductClient";

type BasicRef = { id: string; name: string };
type ProductData = {
  id: string;
  phoneModelId: string;
  typeId: string;
  supplierId: string | null;
  color: { id: string; name: string; hexCode: string };
  material?: { id: string; name: string } | null;
  compatibility?: { id: string; name: string; deviceType: string } | null;
  stock: number;
  minStock: number;
  priceRetail: number;
  priceWholesale: number;
  costPrice: number;
  hasDiscount?: boolean;
  discountPercentage?: number | null;
  discountPrice?: number | null;
};

export default function ProductEditDialog({
  trigger,
  product,
  productTypes,
  suppliers,
  phoneModels,
  colors,
  materials,
  compatibilities,
}: {
  product: ProductData;
  productTypes: BasicRef[];
  suppliers: BasicRef[];
  phoneModels: BasicRef[];
  colors: { id: string; name: string; hexCode: string }[];
  materials: { id: string; name: string }[];
  compatibilities: { id: string; name: string; deviceType: string }[];
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl p-4">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-lg font-semibold">
            Editar Producto
          </DialogTitle>
        </DialogHeader>
        <EditProductClient
          product={product}
          productTypes={productTypes}
          suppliers={suppliers}
          phoneModels={phoneModels}
          colors={colors}
          materials={materials}
          compatibilities={compatibilities}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
