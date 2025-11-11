"use client";
import { useState } from "react";
import { ProductForm } from '@/components/product-form';

export default function NewProductClient({ productTypes, suppliers, phoneModels, onSuccess }: {
  productTypes: { id: string; name: string }[];
  suppliers: { id: string; name: string }[];
  phoneModels: { id: string; name: string }[];
  onSuccess?: () => void;
}) {
  const [loading, setLoading] = useState(false);

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
      onSubmit={handleProductSubmit}
      loading={loading}
    />
  );
}
