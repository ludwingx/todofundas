"use client";
import { useState, useEffect } from "react";
import { ProductForm } from '@/components/product-form';
import { getColors } from "@/lib/api/colors";

export default function NewProductClient({ productTypes, suppliers, phoneModels: initialPhoneModels, onSuccess }: {
  productTypes: { id: string; name: string }[];
  suppliers: { id: string; name: string }[];
  phoneModels: { id: string; name: string }[];
  onSuccess?: () => void;
}) {
  const [phoneModels, setPhoneModels] = useState(initialPhoneModels);
  
  useEffect(() => {
    async function loadActivePhoneModels() {
      try {
        const response = await fetch('/api/phone-models?status=active');
        if (response.ok) {
          const data = await response.json();
          setPhoneModels(data);
        }
      } catch (error) {
        console.error('Error loading active phone models:', error);
      }
    }
    
    loadActivePhoneModels();
  }, []);
  const [loading, setLoading] = useState(false);
  const [colors, setColors] = useState<{ id: string; name: string; hexCode: string }[]>([]);

  useEffect(() => {
    async function loadColors() {
      const colorsData = await getColors();
      setColors(colorsData);
    }
    loadColors();
  }, []);

  async function handleProductSubmit(data: FormData) {
    setLoading(true);
    try {
      const result = await fetch('/api/products', {
        method: 'POST',
        body: data // data es FormData, no poner headers
      });
      const resJson = await result.json();
      if (resJson.success) {
        const { toast } = await import('sonner');
        toast.success('Producto creado exitosamente');
        window.location.reload();
      } else {
        alert(resJson.error || 'Error al crear el producto');
      }
    } catch (err) {
      alert('Error de red o del servidor');
    }
    setLoading(false);
  }

  return (
    <ProductForm
      productTypes={productTypes}
      suppliers={suppliers}
      phoneModels={phoneModels}
      colors={colors}
      onSubmit={handleProductSubmit}
      loading={loading}
    />
  );
}
