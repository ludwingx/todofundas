"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProductForm } from '@/components/product-form';
import { toast } from 'sonner';

type BasicRef = { id: string; name: string }
type ProductData = {
  id: string;
  phoneModelId: string;
  typeId: string;
  supplierId: string | null;
  color: string;
  stock: number;
  minStock: number;
  priceRetail: number;
  priceWholesale: number;
  costPrice: number;
}

export default function EditProductClient({ product, productTypes, suppliers, phoneModels, onSuccess }: {
  product: ProductData;
  productTypes: BasicRef[];
  suppliers: BasicRef[];
  phoneModels: BasicRef[];
  onSuccess?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  async function handleProductSubmit(data: FormData) {
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
