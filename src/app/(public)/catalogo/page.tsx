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
      images: { select: { url: true } },
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
    stock: p.stock,
    materialName: p.material?.name,
    images: p.images.map(img => img.url)
  }));

  // Fetch filter options
  const [brands, models, types] = await Promise.all([
    prisma.brand.findMany({ where: { status: "active" }, select: { id: true, name: true } }),
    prisma.phoneModel.findMany({ where: { status: "active" }, select: { id: true, name: true, brandId: true } }),
    prisma.productType.findMany({ select: { id: true, name: true } }),
  ]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="bg-white dark:bg-black py-16 md:py-24 border-b border-gray-100 dark:border-white/10 relative overflow-hidden">
        {/* Background Decorative Text */}
        <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/4 opacity-[0.03] dark:opacity-[0.05] pointer-events-none select-none hidden lg:block">
          <span className="text-[20rem] font-black italic leading-none uppercase tracking-tighter">
            Collection
          </span>
        </div>

        <div className="container px-4 md:px-6 relative z-10">
          <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-gray-400 mb-4 italic">
            Market GS / Curated Selection
          </p>
          <h1 className="text-6xl md:text-9xl font-black tracking-tighter uppercase italic leading-[0.8] mb-8">
            Catálogo
          </h1>
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-12">
            <div className="h-[2px] w-20 bg-black dark:bg-white" />
            <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm font-bold uppercase tracking-widest max-w-[400px] leading-relaxed italic">
              Piezas seleccionadas para elevar la estética y protección de tu iPhone.
            </p>
          </div>
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
