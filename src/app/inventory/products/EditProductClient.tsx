"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProductForm } from '@/components/product-form';
import { toast } from 'sonner';

export default function EditProductClient({ product, productTypes, suppliers, phoneModels, onSuccess }: {
  product: any;
  productTypes: { id: string; name: string }[];
  suppliers: { id: string; name: string }[];
  phoneModels: { id: string; name: string }[];
  onSuccess?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  

  async function handleProductSubmit(data: any) {
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        body: data,
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Producto actualizado', { description: 'Los cambios se guardaron correctamente.' });
        router.refresh();
        onSuccess?.();
      } else {
        toast.error('Error al actualizar', { description: json.error || 'Ocurrió un error al actualizar el producto.' });
      }
    } catch (e) {
      toast.error('Error de red', { description: 'No se pudo conectar con el servidor.' });
    }
    setLoading(false);
  }

  return (
    <ProductForm
      product={product}
      productTypes={productTypes}
      suppliers={suppliers}
      phoneModels={phoneModels}
      onSubmit={handleProductSubmit}
      loading={loading}
    />
  );
}
