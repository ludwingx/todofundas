"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProductForm } from '@/components/product-form';
import { toast } from 'sonner';
import { getColors } from "@/lib/api/colors";

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
  const [colors, setColors] = useState<{ id: string; name: string; hexCode: string }[]>([]);
  const router = useRouter();

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
      // Mostrar los datos que se están enviando
      const formDataObj: Record<string, any> = {};
      for (const [key, value] of data.entries()) {
        formDataObj[key] = value;
      }
      console.log('Datos del formulario:', formDataObj);
      
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        body: data,
      });
      
      const responseText = await res.text();
      let json;
      try {
        json = JSON.parse(responseText);
      } catch (e) {
        console.error('Error al parsear la respuesta del servidor:', responseText);
        throw new Error('Respuesta del servidor no válida');
      }
      
      console.log('Respuesta del servidor:', { status: res.status, json });
      
      if (res.ok && json.success) {
        toast.success('Producto actualizado', { description: 'Los cambios se guardaron correctamente.' });
        router.refresh();
        onSuccess?.();
      } else {
        console.error('Error en la respuesta del servidor:', { status: res.status, json });
        const errorMessage = json.error || 'Ocurrió un error al actualizar el producto.';
        toast.error('Error al actualizar', { description: errorMessage });
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
      colors={colors}
      onSubmit={handleProductSubmit}
      loading={loading}
    />
  );
}
