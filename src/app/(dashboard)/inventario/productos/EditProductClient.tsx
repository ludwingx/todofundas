"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProductForm } from "@/components/product-form";
import { toast } from "sonner";

type BasicRef = { id: string; name: string };
type ProductData = {
  id: string;
  phoneModelId: string;
  typeId: string;
  supplierId: string | null;
  color: { id: string; name: string; hexCode: string };
  material?: { id: string; name: string } | null;
  stock: number;
  minStock: number;
  priceRetail: number;
  priceWholesale: number;
  costPrice: number;
  hasDiscount?: boolean;
  discountPercentage?: number | null;
  discountPrice?: number | null;
};

export default function EditProductClient({
  product,
  productTypes,
  suppliers,
  phoneModels,
  colors,
  materials,
  onSuccess,
}: {
  product: ProductData;
  productTypes: BasicRef[];
  suppliers: BasicRef[];
  phoneModels: BasicRef[];
  colors: { id: string; name: string; hexCode: string }[];
  materials: { id: string; name: string }[];
  onSuccess?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleProductSubmit(data: FormData) {
    setLoading(true);
    try {
      // Para debug: mostrar los datos que se están enviando
      const formDataObj: Record<string, any> = {};
      for (const [key, value] of data.entries()) {
        formDataObj[key] = value;
      }
      console.log("Datos del formulario:", formDataObj);

      const res = await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        body: data,
      });

      const responseText = await res.text();
      let json;
      try {
        json = JSON.parse(responseText);
      } catch (e) {
        console.error(
          "Error al parsear la respuesta del servidor:",
          responseText
        );
        throw new Error("Respuesta del servidor no válida");
      }

      console.log("Respuesta del servidor:", { status: res.status, json });

      if (res.ok && json.success) {
        toast.success("Producto actualizado", {
          description: "Los cambios se guardaron correctamente.",
        });
        router.refresh();
        onSuccess?.();
      } else {
        console.error("Error en la respuesta del servidor:", {
          status: res.status,
          json,
        });
        const errorMessage =
          json.error || "Ocurrió un error al actualizar el producto.";
        toast.error("Error al actualizar", { description: errorMessage });
      }
    } catch (e) {
      toast.error("Error de red", {
        description: "No se pudo conectar con el servidor.",
      });
    }
    setLoading(false);
  }

  // Necesitamos transformar product.color de objeto a colorId para el formulario
  const productForForm = {
    ...product,
    colorId: product.color.id,
    materialId: product.material?.id || null,
  };

  return (
    <ProductForm
      product={productForForm}
      productTypes={productTypes}
      suppliers={suppliers}
      phoneModels={phoneModels}
      colors={colors}
      materials={materials}
      onSubmit={handleProductSubmit}
      loading={loading}
    />
  );
}
