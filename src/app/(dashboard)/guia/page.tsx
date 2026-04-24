import { prisma } from "@/lib/prisma";
import { GuiaClient } from "@/app/(dashboard)/guia/guia-client";

/**
 * Server Component: consulta el estado real de la BD
 * para determinar qué pasos del tutorial están completados.
 */
export default async function GuiaPage() {
  const [
    brandCount,
    phoneModelCount,
    productTypeCount,
    materialCount,
    colorCount,
    productCount,
    purchaseCount,
    saleCount,
    transactionCount,
    supplierCount,
  ] = await Promise.all([
    prisma.brand.count(),
    prisma.phoneModel.count(),
    prisma.productType.count(),
    prisma.material.count(),
    prisma.color.count(),
    prisma.product.count(),
    prisma.purchase.count(),
    prisma.sale.count(),
    prisma.walletTransaction.count(),
    prisma.supplier.count(),
  ]);

  const completedItems = {
    marcas: brandCount > 0,
    tipos: productTypeCount > 0,
    materiales: materialCount > 0,
    modelos: phoneModelCount > 0,
    colores: colorCount > 0,
    productos: productCount > 0,
    compras: purchaseCount > 0,
    ventas: saleCount > 0,
    wallet: transactionCount > 0,
    proveedores: supplierCount > 0,
  };

  return <GuiaClient completedItems={completedItems} />;
}
