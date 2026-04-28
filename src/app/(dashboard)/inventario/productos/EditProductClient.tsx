"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProductForm, ProductFormData } from "@/components/product-form";
import { toast } from "sonner";

type BasicRef = { id: string; name: string };
type ProductData = {
  id: string;
  phoneModelId: string;
  typeId: string;
  color: { id: string; name: string; hexCode: string };
  material?: { id: string; name: string } | null;
  minStock: number;
  priceRetail?: number | null;
  priceWholesale?: number | null;
  hasDiscount?: boolean;
  discountPercentage?: number | null;
  discountPrice?: number | null;
  isPublic?: boolean;
  publicPrice?: number | null;
};

export default function EditProductClient({
  product,
  productTypes,
  phoneModels,
  colors,
  materials,
  compatibilities,
  onSuccess,
}: {
  product: ProductData;
  productTypes: BasicRef[];
  phoneModels: { id: string; name: string; brand?: { name: string } }[];
  colors: { id: string; name: string; hexCode: string }[];
  materials: { id: string; name: string }[];
  compatibilities: { id: string; name: string; deviceType: string }[];
  onSuccess?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleProductSubmit(values: ProductFormData & { images: File[], coverIndex: number }) {
    setLoading(true);
    try {
      const formData = new FormData();
      
      // Separar imágenes existentes de las nuevas
      // El formulario ahora nos pasa todos los datos
      // Pero EditProductClient necesita saber cuáles son de URL y cuáles de FILE
      
      // 1. Filtrar campos de texto normales
      Object.entries(values).forEach(([key, value]) => {
        if (key !== 'images' && value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      // 2. Manejar imágenes
      // Necesitamos el estado interno de imágenes del formulario
      // Pero onSubmit solo recibe lo procesado. 
      // Vamos a confiar en lo que envíe ProductForm.
      
      // Añadimos las imágenes nuevas (archivos)
      values.images.forEach(file => {
        formData.append("images", file);
      });

      // Añadimos el coverIndex
      formData.append("coverIndex", String(values.coverIndex));

      // 3. Añadir imágenes existentes (las que no son archivos)
      formData.append("existingImages", JSON.stringify(values.existingImages));

      const res = await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        body: formData,
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
      phoneModels={phoneModels}
      colors={colors}
      materials={materials}
      compatibilities={compatibilities}
      onSubmit={handleProductSubmit}
      loading={loading}
    />
  );
}
