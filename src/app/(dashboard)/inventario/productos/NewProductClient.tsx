"use client";
import { useState, useEffect } from "react";
import { ProductForm } from "@/components/product-form";

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
  phoneModels: { id: string; name: string }[];
  colors: { id: string; name: string; hexCode: string }[];
  materials: { id: string; name: string }[];
  compatibilities: { id: string; name: string; deviceType: string }[];
  onSuccess?: () => void;
}) {
  const [phoneModels, setPhoneModels] = useState(initialPhoneModels);
  const [colors, setColors] = useState(initialColors);
  const [loading, setLoading] = useState(false);

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

  async function handleProductSubmit(data: FormData) {
    setLoading(true);
    try {
      const result = await fetch("/api/products", {
        method: "POST",
        body: data, // data es FormData, no poner headers
      });
      const resJson = await result.json();
      if (resJson.success) {
        const { toast } = await import("sonner");
        toast.success("Producto creado exitosamente");
        window.location.reload();
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
