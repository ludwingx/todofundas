import { prisma } from "@/lib/prisma";
import CatalogClient from "./CatalogClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Catálogo de Productos | Market GS",
  description: "Encuentra las mejores fundas y protectores para tu celular.",
};

export default async function CatalogPage() {
  // Fetch active products
  const productsData = await prisma.product.findMany({
    where: { 
      status: "active",
      stock: { gt: 0 } // Only show products in stock in the public catalog
    },
    include: {
      type: { select: { id: true, name: true } },
      phoneModel: { 
        select: { 
          id: true, 
          name: true, 
          brandId: true,
          brand: { select: { id: true, name: true } }
        } 
      },
      color: { select: { id: true, name: true, hexCode: true } },
      material: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const products = productsData.map(p => ({
    id: p.id,
    name: `${p.type?.name} para ${p.phoneModel?.name}`,
    price: p.priceRetail,
    imageUrl: p.imageUrl,
    brandId: p.phoneModel?.brandId,
    brandName: p.phoneModel?.brand?.name,
    modelId: p.phoneModel?.id,
    modelName: p.phoneModel?.name,
    typeId: p.type?.id,
    typeName: p.type?.name,
    colorName: p.color?.name,
    colorHex: p.color?.hexCode,
    stock: p.stock
  }));

  // Fetch filter options
  const [brands, models, types] = await Promise.all([
    prisma.brand.findMany({ where: { status: "active" }, select: { id: true, name: true } }),
    prisma.phoneModel.findMany({ where: { status: "active" }, select: { id: true, name: true, brandId: true } }),
    prisma.productType.findMany({ select: { id: true, name: true } }),
  ]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="bg-black text-white py-12 md:py-16">
        <div className="container px-4 md:px-6">
          <h1 className="text-3xl font-bold tracking-tight md:text-5xl mb-4">Catálogo de Productos</h1>
          <p className="text-gray-400 max-w-[600px] text-lg">
            Explora nuestra colección premium. Utiliza los filtros para encontrar exactamente lo que necesitas para tu equipo.
          </p>
        </div>
      </div>
      
      <div className="container px-4 md:px-6 py-8">
        <CatalogClient 
          initialProducts={products} 
          brands={brands} 
          models={models} 
          types={types} 
        />
      </div>
    </div>
  );
}
