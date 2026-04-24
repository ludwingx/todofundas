import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageCircle, ArrowLeft, Smartphone, ShieldCheck, Zap, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/social-icons";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      type: true,
      phoneModel: {
        include: {
          brand: true,
        },
      },
      color: true,
      material: true,
      images: {
        orderBy: {
          isCover: "desc",
        },
      },
    },
  });

  if (!product || product.status !== "active") {
    notFound();
  }

  const WA_NUMBER = "59170000000";
  const message = `Hola! Estoy interesado en el producto: ${product.type?.name} para ${product.phoneModel?.name} (${product.color?.name}). ¿Sigue disponible?`;
  const WA_LINK = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;

  const allImages = product.images.length > 0 
    ? product.images 
    : (product.imageUrl ? [{ url: product.imageUrl, isCover: true }] : []);

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Navigation */}
      <div className="border-b border-gray-100 dark:border-white/10">
        <div className="container px-4 md:px-6 py-4">
          <Link 
            href="/catalogo" 
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-black dark:hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-1" />
            Volver al catálogo
          </Link>
        </div>
      </div>

      <main className="container px-4 md:px-6 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24">
          
          {/* Visuals Column */}
          <div className="space-y-6">
            <div className="relative aspect-[4/5] bg-gray-50 dark:bg-gray-950 overflow-hidden border border-gray-100 dark:border-white/10">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.phoneModel?.name || "Producto"}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Smartphone className="w-20 h-20 text-gray-200 dark:text-gray-800" />
                </div>
              )}
            </div>

            {/* Gallery Thumbnails */}
            {allImages.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {allImages.map((img, idx) => (
                  <div 
                    key={img.id || idx} 
                    className="relative aspect-square bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-white/10 overflow-hidden"
                  >
                    <Image
                      src={img.url}
                      alt={`Vista ${idx + 1}`}
                      fill
                      className="object-cover hover:opacity-80 transition-opacity cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details Column */}
          <div className="flex flex-col justify-center">
            <div className="space-y-8">
              <div>
                <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-gray-400 mb-4 italic">
                  {product.phoneModel?.brand?.name} / {product.phoneModel?.name}
                </p>
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-[0.9] mb-6">
                  {product.type?.name}
                  <br />
                  <span className="text-gray-300 dark:text-gray-700">Edición Luxury</span>
                </h1>
                <div className="flex items-center gap-4 pt-4">
                  <div className="h-[2px] w-12 bg-black dark:bg-white" />
                  <span className="text-2xl md:text-4xl font-black italic">
                    Bs. {product.priceRetail?.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="space-y-6 pt-8 border-t border-gray-100 dark:border-white/10">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Color</p>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full border border-gray-200 dark:border-white/20" 
                        style={{ backgroundColor: product.color?.hexCode }} 
                      />
                      <span className="text-xs font-black uppercase tracking-widest">{product.color?.name}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Material</p>
                    <span className="text-xs font-black uppercase tracking-widest">{product.material?.name || "Premium Composite"}</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Disponibilidad</p>
                    <span className="text-xs font-black uppercase tracking-widest">
                      {product.stock > 0 ? `En Stock (${product.stock})` : "Agotado"}
                    </span>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Compatibilidad</p>
                    <span className="text-xs font-black uppercase tracking-widest">{product.phoneModel?.name}</span>
                  </div>
                </div>
              </div>

              <div className="pt-10 space-y-4">
                <Link href={WA_LINK} target="_blank" className="block">
                  <Button className="w-full h-16 bg-black dark:bg-white text-white dark:text-black hover:opacity-90 transition-all rounded-none font-black text-xs uppercase tracking-[0.3em] border-none shadow-2xl flex items-center justify-center gap-4">
                    <MessageCircle className="w-5 h-5" />
                    Consultar Disponibilidad
                  </Button>
                </Link>
                <p className="text-[9px] text-center text-gray-400 uppercase tracking-widest font-bold">
                  Respuesta inmediata por WhatsApp
                </p>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 border-t border-gray-100 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 opacity-20" />
                  <p className="text-[8px] font-black uppercase tracking-widest leading-tight">Calidad<br/>Garantizada</p>
                </div>
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 opacity-20" />
                  <p className="text-[8px] font-black uppercase tracking-widest leading-tight">Diseño<br/>Exclusivo</p>
                </div>
                <div className="flex items-center gap-3">
                  <Truck className="w-5 h-5 opacity-20" />
                  <p className="text-[8px] font-black uppercase tracking-widest leading-tight">Envío<br/>Express</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
