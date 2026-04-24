"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProductForm, ProductFormData } from "@/components/product-form";

export default function NewProductClient({
  productTypes,
  suppliers,
  phoneModels: initialPhoneModels,
  colors: initialColors,
  materials,
  compatibilities,
  onSuccess,
}: {
  productTypes: { id: string; name: string }[];
  suppliers: { id: string; name: string }[];
  phoneModels: { id: string; name: string; brand?: { name: string } }[];
  colors: { id: string; name: string; hexCode: string }[];
  materials: { id: string; name: string }[];
  compatibilities: { id: string; name: string; deviceType: string }[];
  onSuccess?: () => void;
}) {
  const [phoneModels, setPhoneModels] = useState(initialPhoneModels);
  const [colors, setColors] = useState(initialColors);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function loadActivePhoneModels() {
      try {
        const response = await fetch("/api/phone-models?status=active");
        if (response.ok) {
          const data = await response.json();
          setPhoneModels(data);
        }
      } catch (error) {
        console.error("Error loading active phone models:", error);
      }
    }

    loadActivePhoneModels();
  }, []);

  async function handleProductSubmit(values: any) {
    setLoading(true);
    try {
      const formData = new FormData();
      
      // Añadir todos los campos base al FormData
      const { images, coverIndex, ...productData } = values;
      
      Object.entries(productData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      // Añadir múltiples imágenes
      if (images && images.length > 0) {
        images.forEach((file: File) => {
          formData.append("images", file);
        });
        formData.append("coverIndex", String(coverIndex || 0));
      }

      const result = await fetch("/api/products", {
        method: "POST",
        body: formData,
      });
      const resJson = await result.json();
      if (resJson.success) {
        const { toast } = await import("sonner");
        toast.success("Producto creado exitosamente");
        router.refresh(); // Actualiza los Server Components (la tabla)
        if (onSuccess) onSuccess();
      } else {
        alert(resJson.error || "Error al crear el producto");
      }
    } catch (err) {
      alert("Error de red o del servidor");
    }
    setLoading(false);
  }

  return (
    <ProductForm
      productTypes={productTypes}
      suppliers={suppliers}
      phoneModels={phoneModels}
      colors={colors}
      materials={materials}
      compatibilities={compatibilities}
      onSubmit={handleProductSubmit}
      loading={loading}
    />
  );
}
