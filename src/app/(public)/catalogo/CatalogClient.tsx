"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { 
  Search, 
  MessageCircle, 
  Smartphone, 
  PackageX, 
  ShieldCheck, 
  Zap, 
  Truck,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type CatalogProduct = {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
  brandId: string | undefined;
  brandName: string | undefined;
  modelId: string | undefined;
  modelName: string | undefined;
  typeId: string | undefined;
  typeName: string | undefined;
  colorName: string | undefined;
  colorHex: string | undefined;
  stock: number;
  materialName?: string;
  images?: string[];
};

export default function CatalogClient({
  initialProducts,
  brands,
  models,
  types,
}: {
  initialProducts: CatalogProduct[];
  brands: { id: string; name: string }[];
  models: { id: string; name: string; brandId: string }[];
  types: { id: string; name: string }[];
}) {
  const [search, setSearch] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(null);

  const filteredModels = useMemo(() => {
    if (!selectedBrand) return models;
    return models.filter((m) => m.brandId === selectedBrand);
  }, [models, selectedBrand]);

  const filteredProducts = useMemo(() => {
    return initialProducts.filter((product) => {
      const matchSearch = product.name.toLowerCase().includes(search.toLowerCase());
      const matchBrand = selectedBrand ? product.brandId === selectedBrand : true;
      const matchModel = selectedModel ? product.modelId === selectedModel : true;
      const matchType = selectedType ? product.typeId === selectedType : true;
      return matchSearch && matchBrand && matchModel && matchType;
    });
  }, [initialProducts, search, selectedBrand, selectedModel, selectedType]);

  const handleWhatsApp = (product: CatalogProduct) => {
    // Reemplaza con el número real de Market GS
    const phoneNumber = "59170000000"; 
    const message = `Hola! Estoy interesado en el producto: ${product.name}. ¿Sigue disponible?`;
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <div className="flex flex-col lg:flex-row gap-12">
      {/* Sidebar de Filtros */}
      <aside className="w-full lg:w-72 shrink-0 space-y-10">
        <div className="space-y-6">
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-6 italic">Búsqueda</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <Input
                placeholder="BUSCAR..."
                className="pl-9 h-12 rounded-none border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 font-black text-[10px] tracking-widest focus-visible:ring-black dark:focus-visible:ring-white transition-all uppercase"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 italic">Marca</label>
              <select
                className="flex h-12 w-full rounded-none border border-gray-100 dark:border-white/10 bg-white dark:bg-black px-4 py-2 text-[10px] font-black tracking-widest uppercase focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all"
                value={selectedBrand}
                onChange={(e) => {
                  setSelectedBrand(e.target.value);
                  setSelectedModel(""); 
                }}
              >
                <option value="">TODAS LAS MARCAS</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 italic">Modelo</label>
              <select
                className="flex h-12 w-full rounded-none border border-gray-100 dark:border-white/10 bg-white dark:bg-black px-4 py-2 text-[10px] font-black tracking-widest uppercase focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all disabled:opacity-30"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                disabled={!selectedBrand && filteredModels.length > 50}
              >
                <option value="">TODOS LOS MODELOS</option>
                {filteredModels.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 italic">Tipo</label>
              <select
                className="flex h-12 w-full rounded-none border border-gray-100 dark:border-white/10 bg-white dark:bg-black px-4 py-2 text-[10px] font-black tracking-widest uppercase focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="">TODOS LOS TIPOS</option>
                {types.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            
            {(search || selectedBrand || selectedModel || selectedType) && (
              <Button 
                variant="link" 
                className="p-0 h-auto text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                onClick={() => {
                  setSearch("");
                  setSelectedBrand("");
                  setSelectedModel("");
                  setSelectedType("");
                }}
              >
                Limpiar Filtros
              </Button>
            )}
          </div>
        </div>
      </aside>

      {/* Grid de Productos */}
      <main className="flex-1">
        <div className="mb-10 flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
            Mostrando <span className="text-black dark:text-white">{filteredProducts.length}</span> PIEZAS
          </p>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <PackageX className="w-10 h-10 text-gray-200 dark:text-gray-800 mb-6" />
            <h3 className="text-sm font-black uppercase tracking-[0.3em] mb-2 italic text-gray-400">Sin resultados</h3>
            <p className="text-[10px] text-gray-300 dark:text-gray-700 uppercase tracking-widest font-bold">
              Intenta con otros filtros.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-10">
            {filteredProducts.map((product) => (
              <div 
                key={product.id} 
                className="group relative flex flex-col transition-all duration-500 bg-white dark:bg-black border border-gray-100 dark:border-white/5 hover:border-black dark:hover:border-white"
              >
                {/* Trigger for Detail Dialog */}
                <button 
                  onClick={() => setSelectedProduct(product)}
                  className="block flex-1 text-left outline-none"
                >
                  {/* Image Container */}
                  <div className="relative aspect-[4/5] bg-gray-50 dark:bg-gray-950 overflow-hidden mb-6 transition-colors">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <Smartphone className="w-16 h-16 text-gray-200 dark:text-gray-800" />
                    )}
                    
                    {/* Badges Overlay */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      {product.colorHex && (
                        <div className="flex items-center gap-2 bg-white/90 dark:bg-black/90 backdrop-blur-md px-2 py-1.5 border border-gray-100 dark:border-white/10">
                          <span 
                            className="w-2 h-2 rounded-full border border-gray-200 dark:border-white/20" 
                            style={{ backgroundColor: product.colorHex }} 
                          />
                          <span className="text-[8px] font-black uppercase tracking-widest leading-none">
                            {product.colorName}
                          </span>
                        </div>
                      )}
                      {product.stock <= 3 && (
                        <div className="bg-black dark:bg-white text-white dark:text-black px-2 py-1.5 text-[8px] font-black uppercase tracking-widest">
                          Últimas {product.stock}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="px-6 pb-2 space-y-2">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-[10px] text-gray-400 dark:text-gray-600 font-black uppercase tracking-[0.2em] italic">
                        {product.brandName} • {product.modelName}
                      </p>
                    </div>
                    <h3 className="font-black text-sm uppercase tracking-tight leading-tight group-hover:italic transition-all">
                      {product.name}
                    </h3>
                    <div className="pt-2">
                      <span className="text-xs font-black uppercase tracking-widest opacity-40 mr-2">Precio:</span>
                      <span className="text-lg font-black italic">Bs. {product.price.toFixed(2)}</span>
                    </div>
                  </div>
                </button>

                {/* Footer with Permanent WhatsApp Button */}
                <div className="p-6 pt-2">
                  <Button 
                    className="w-full h-12 bg-black dark:bg-white text-white dark:text-black hover:opacity-80 transition-all rounded-none font-black text-[10px] uppercase tracking-[0.2em] border-none shadow-none" 
                    onClick={() => handleWhatsApp(product)}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Consultar por WhatsApp
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Product Detail Dialog */}
      <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden rounded-none border-none bg-white dark:bg-black h-full md:h-auto max-h-[95vh]">
          {selectedProduct && (
            <div className="grid grid-cols-1 md:grid-cols-12 h-full overflow-hidden">
              
              {/* Left Column: Visuals (7/12 on desktop) */}
              <div className="md:col-span-7 bg-gray-50 dark:bg-gray-950 flex flex-col border-r border-gray-100 dark:border-white/5">
                <div className="relative flex-1 aspect-square md:aspect-auto overflow-hidden min-h-[350px]">
                  <Image
                    src={selectedProduct.imageUrl || "/placeholder.jpg"}
                    alt={selectedProduct.name}
                    fill
                    className="object-cover transition-all duration-700"
                    id="main-product-image"
                    priority
                  />
                  {/* Stock Badge Overlay */}
                  {selectedProduct.stock <= 3 && (
                    <div className="absolute top-6 left-6 bg-black dark:bg-white text-white dark:text-black px-3 py-1.5 text-[10px] font-black uppercase tracking-widest italic">
                      Escasez: {selectedProduct.stock} unidades
                    </div>
                  )}
                </div>
                
                {/* Interactive Gallery */}
                {selectedProduct.images && selectedProduct.images.length > 1 && (
                  <div className="flex gap-3 p-6 bg-white dark:bg-black/40 overflow-x-auto scrollbar-hide">
                    {[selectedProduct.imageUrl, ...selectedProduct.images.filter(img => img !== selectedProduct.imageUrl)].map((img, idx) => (
                      <button 
                        key={idx} 
                        onClick={() => {
                          const mainImg = document.getElementById('main-product-image') as HTMLImageElement;
                          if (mainImg) mainImg.src = img || "";
                        }}
                        className="w-20 h-20 shrink-0 border-2 border-transparent hover:border-black dark:hover:border-white transition-all bg-gray-100 dark:bg-gray-900 overflow-hidden relative group"
                      >
                        <img src={img || ""} alt={`V${idx}`} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Information (5/12 on desktop) */}
              <div className="md:col-span-5 p-8 md:p-12 flex flex-col bg-white dark:bg-black overflow-y-auto">
                <div className="flex-1 space-y-10">
                  {/* Header Info */}
                  <header className="space-y-4">
                    <div className="flex items-center gap-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 italic">
                        {selectedProduct.brandName} • {selectedProduct.modelName}
                      </p>
                    </div>
                    <DialogHeader className="p-0 text-left">
                      <DialogTitle className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic leading-[0.85]">
                        {selectedProduct.typeName}
                        <br />
                        <span className="text-gray-200 dark:text-gray-800">Curated Series</span>
                      </DialogTitle>
                    </DialogHeader>
                    <div className="flex items-center gap-4 pt-4">
                      <div className="h-[2px] w-12 bg-black dark:bg-white" />
                      <span className="text-2xl md:text-3xl font-black italic">
                        Bs. {selectedProduct.price.toFixed(2)}
                      </span>
                    </div>
                  </header>

                  {/* Product Specification Grid */}
                  <div className="grid grid-cols-1 gap-y-6 pt-8 border-t border-gray-100 dark:border-white/5">
                    <div className="flex items-center justify-between group">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic group-hover:text-black dark:group-hover:text-white transition-colors">Color</span>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] font-black uppercase tracking-widest">{selectedProduct.colorName}</span>
                        <div 
                          className="w-3.5 h-3.5 rounded-full border border-gray-200 dark:border-white/20" 
                          style={{ backgroundColor: selectedProduct.colorHex }} 
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between group">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic group-hover:text-black dark:group-hover:text-white transition-colors">Material</span>
                      <span className="text-[11px] font-black uppercase tracking-widest">{selectedProduct.materialName || "Aero-Composite"}</span>
                    </div>

                    <div className="flex items-center justify-between group">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic group-hover:text-black dark:group-hover:text-white transition-colors">Disponibilidad</span>
                      <span className={`text-[11px] font-black uppercase tracking-widest ${selectedProduct.stock <= 3 ? 'text-orange-500' : ''}`}>
                        {selectedProduct.stock > 0 ? `Stock: ${selectedProduct.stock} uds.` : "Agotado"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between group">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic group-hover:text-black dark:group-hover:text-white transition-colors">Compatibilidad</span>
                      <span className="text-[11px] font-black uppercase tracking-widest">{selectedProduct.modelName}</span>
                    </div>
                  </div>

                  {/* Trust Markers */}
                  <div className="flex justify-between items-center pt-8 border-t border-gray-100 dark:border-white/5 opacity-40">
                    <div className="flex flex-col items-center gap-2">
                      <ShieldCheck className="w-5 h-5" />
                      <span className="text-[7px] font-black uppercase tracking-tighter">Auténtico</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <Zap className="w-5 h-5" />
                      <span className="text-[7px] font-black uppercase tracking-tighter">Ultra-Slim</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <Truck className="w-5 h-5" />
                      <span className="text-[7px] font-black uppercase tracking-tighter">Envío Local</span>
                    </div>
                  </div>
                </div>

                {/* Call to Action */}
                <div className="pt-12">
                  <Button 
                    className="w-full h-16 bg-black dark:bg-white text-white dark:text-black hover:opacity-80 transition-all rounded-none font-black text-xs uppercase tracking-[0.4em] border-none shadow-2xl flex items-center justify-center gap-4 group"
                    onClick={() => handleWhatsApp(selectedProduct)}
                  >
                    <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    Comprar ahora
                  </Button>
                  <p className="mt-4 text-[8px] text-center text-gray-400 uppercase tracking-[0.2em] font-black italic">
                    Conexión directa vía WhatsApp • Market GS
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
