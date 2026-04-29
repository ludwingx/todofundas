"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { 
  Search, 
  MessageCircle, 
  Smartphone, 
  PackageX, 
  ShieldCheck, 
  Zap, 
  Truck,
  X,
  SlidersHorizontal,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type ProductVariant = {
  id: string;
  colorName: string | undefined;
  colorHex: string | undefined;
  stock: number;
  price: number;
  imageUrl: string | null;
  images: string[];
};

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
  materialName?: string;
  variants: ProductVariant[];
};

export default function CatalogClient({
  initialProducts,
  brands,
  models,
  types,
  colors,
}: {
  initialProducts: CatalogProduct[];
  brands: { id: string; name: string }[];
  models: { id: string; name: string; brandId: string }[];
  types: { id: string; name: string }[];
  colors: { id: string; name: string; hexCode: string }[];
}) {
  const [search, setSearch] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(null);
  const [activeVariant, setActiveVariant] = useState<ProductVariant | null>(null);

  // Update active variant when a product is selected
  useEffect(() => {
    if (selectedProduct) {
      setActiveVariant(selectedProduct.variants[0]);
    } else {
      setActiveVariant(null);
    }
  }, [selectedProduct]);

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
      
      // Filter by color in variants
      const matchColor = selectedColor 
        ? product.variants.some(v => v.colorHex?.toLowerCase() === selectedColor.toLowerCase()) 
        : true;

      return matchSearch && matchBrand && matchModel && matchType && matchColor;
    });
  }, [initialProducts, search, selectedBrand, selectedModel, selectedType, selectedColor]);

  const handleWhatsApp = (variant: ProductVariant, productName: string) => {
    const phoneNumber = "59170000000"; 
    const message = `Hola! Estoy interesado en el producto: ${productName} (Color: ${variant.colorName}). ¿Sigue disponible?`;
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const FiltersContent = () => (
    <div className="space-y-10">
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
          {/* Marca */}
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
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Modelo */}
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
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          {/* Tipo */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 italic">Tipo</label>
            <select
              className="flex h-12 w-full rounded-none border border-gray-100 dark:border-white/10 bg-white dark:bg-black px-4 py-2 text-[10px] font-black tracking-widest uppercase focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="">TODOS LOS TIPOS</option>
              {types.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* Colores */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 italic">Paleta de Colores</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedColor("")}
                className={cn(
                  "w-8 h-8 rounded-full border flex items-center justify-center text-[8px] font-black uppercase",
                  selectedColor === "" ? "border-black dark:border-white bg-black dark:bg-white text-white dark:text-black" : "border-gray-200 dark:border-white/10"
                )}
              >
                All
              </button>
              {colors.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedColor(c.hexCode)}
                  className={cn(
                    "w-8 h-8 rounded-full border-2 transition-all",
                    selectedColor === c.hexCode ? "border-black dark:border-white scale-110" : "border-transparent"
                  )}
                  style={{ backgroundColor: c.hexCode }}
                  title={c.name}
                />
              ))}
            </div>
          </div>
          
          {(search || selectedBrand || selectedModel || selectedType || selectedColor) && (
            <Button 
              variant="link" 
              className="p-0 h-auto text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-black dark:hover:text-white transition-colors"
              onClick={() => {
                setSearch("");
                setSelectedBrand("");
                setSelectedModel("");
                setSelectedType("");
                setSelectedColor("");
              }}
            >
              Limpiar Filtros
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-12">
      {/* Sidebar de Filtros - Desktop */}
      <aside className="hidden lg:block w-72 shrink-0">
        <FiltersContent />
      </aside>

      {/* Header y Filtros - Mobile */}
      <div className="lg:hidden flex items-center justify-between mb-8 pb-4 border-b border-gray-100 dark:border-white/10">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
          <span className="text-black dark:text-white">{filteredProducts.length}</span> PIEZAS
        </p>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="rounded-none border-black dark:border-white font-black text-[10px] uppercase tracking-widest px-6">
              <SlidersHorizontal className="w-3 h-3 mr-2" />
              Filtrar
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] bg-white dark:bg-black border-none p-8">
            <SheetHeader className="mb-10">
              <SheetTitle className="text-left text-xl font-black italic uppercase tracking-tighter">Filtros</SheetTitle>
            </SheetHeader>
            <FiltersContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Grid de Productos */}
      <main className="flex-1">
        <div className="hidden lg:flex mb-10 items-center justify-between border-b border-gray-100 dark:border-white/10 pb-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
            Mostrando <span className="text-black dark:text-white">{filteredProducts.length}</span> PIEZAS
          </p>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <PackageX className="w-10 h-10 text-gray-200 dark:text-gray-800 mb-6" />
            <h3 className="text-sm font-black uppercase tracking-[0.3em] mb-2 italic text-gray-400">Sin resultados</h3>
            <p className="text-[10px] text-gray-300 dark:text-gray-700 uppercase tracking-widest font-bold italic">
              Prueba ajustando los filtros de búsqueda.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-12">
            {filteredProducts.map((product) => (
              <div 
                key={product.id} 
                className="group relative flex flex-col transition-all duration-500 bg-white dark:bg-black border border-gray-100 dark:border-white/5 hover:border-black dark:hover:border-white"
              >
                <button 
                  onClick={() => setSelectedProduct(product)}
                  className="block flex-1 text-left outline-none"
                >
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
                    
                    {/* Badge de Variantes */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      <div className="bg-white/90 dark:bg-black/90 backdrop-blur-md px-2 py-1.5 border border-gray-100 dark:border-white/10 shadow-sm">
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] leading-none">
                          {product.variants.length} Colores
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 pb-2 space-y-2">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-[10px] text-gray-400 dark:text-gray-600 font-black uppercase tracking-[0.2em] italic">
                        {product.brandName} • {product.modelName}
                      </p>
                    </div>
                    <h3 className="font-black text-sm uppercase tracking-tight leading-tight group-hover:italic transition-all">
                      {product.name}
                    </h3>
                    <div className="pt-2 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-black uppercase tracking-widest opacity-40 mr-2">Desde:</span>
                        <span className="text-lg font-black italic">Bs. {product.price?.toFixed(2) ?? "0.00"}</span>
                      </div>
                      <div className="flex -space-x-1">
                        {product.variants.slice(0, 3).map((v, i) => (
                          <div 
                            key={i} 
                            className="w-3 h-3 rounded-full border border-white dark:border-black ring-1 ring-gray-200 dark:ring-white/10"
                            style={{ backgroundColor: v.colorHex }}
                          />
                        ))}
                        {product.variants.length > 3 && (
                          <span className="text-[8px] font-bold text-gray-400 pl-2">+{product.variants.length - 3}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>

                <div className="p-6 pt-2">
                  <Button 
                    className="w-full h-12 bg-black dark:bg-white text-white dark:text-black hover:opacity-80 transition-all rounded-none font-black text-[10px] uppercase tracking-[0.2em] border-none shadow-none" 
                    onClick={() => setSelectedProduct(product)}
                  >
                    Ver Variantes
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Product Detail Dialog */}
      <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
        <DialogContent className="w-[95vw] md:w-full max-w-5xl sm:max-w-5xl p-0 overflow-y-auto md:overflow-hidden rounded-none border-none bg-white dark:bg-black h-auto max-h-[95vh]">
          {selectedProduct && activeVariant && (
            <div className="grid grid-cols-1 md:grid-cols-12 md:h-full md:overflow-hidden">
              
              {/* Left Column: Visuals */}
              <div className="md:col-span-7 bg-gray-50 dark:bg-gray-950 flex flex-col border-r border-gray-100 dark:border-white/5">
                <div className="relative flex-1 aspect-square md:aspect-auto overflow-hidden min-h-[400px]">
                  <Image
                    src={activeVariant.imageUrl || selectedProduct.imageUrl || "/placeholder.jpg"}
                    alt={selectedProduct.name}
                    fill
                    className="object-cover transition-all duration-700"
                    key={activeVariant.id}
                    priority
                  />
                  {activeVariant.stock <= 3 && (
                    <div className="absolute top-6 left-6 bg-black dark:bg-white text-white dark:text-black px-3 py-1.5 text-[10px] font-black uppercase tracking-widest italic">
                      Quedan {activeVariant.stock} uds.
                    </div>
                  )}
                </div>
                
                {/* Variant Images Gallery */}
                {activeVariant.images && activeVariant.images.length > 0 && (
                  <div className="flex gap-3 p-6 bg-white dark:bg-black/40 overflow-x-auto scrollbar-hide">
                    {activeVariant.images.map((img, idx) => (
                      <button 
                        key={idx} 
                        className="w-20 h-20 shrink-0 border-2 border-transparent hover:border-black dark:hover:border-white transition-all bg-gray-100 dark:bg-gray-900 overflow-hidden relative group"
                      >
                        <img src={img} alt={`V${idx}`} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Information */}
              <div className="md:col-span-5 p-8 md:p-12 flex flex-col bg-white dark:bg-black md:overflow-y-auto">
                <div className="flex-1 space-y-10">
                  <header className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 italic">
                      {selectedProduct.brandName} • {selectedProduct.modelName}
                    </p>
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
                        Bs. {activeVariant.price?.toFixed(2) ?? "0.00"}
                      </span>
                    </div>
                  </header>

                  {/* VARIANT SELECTOR */}
                  <div className="space-y-6 pt-8 border-t border-gray-100 dark:border-white/5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">
                        Selecciona Color
                      </label>
                      <span className="text-[10px] font-black uppercase tracking-widest text-black dark:text-white italic bg-gray-100 dark:bg-white/10 px-2 py-1">
                        {activeVariant.colorName}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {selectedProduct.variants.map((v) => (
                        <button
                          key={v.id}
                          onClick={() => setActiveVariant(v)}
                          className={cn(
                            "w-10 h-10 rounded-full border-2 p-0.5 transition-all",
                            activeVariant.id === v.id ? "border-black dark:border-white scale-110 shadow-lg" : "border-transparent opacity-60 hover:opacity-100"
                          )}
                        >
                          <div 
                            className="w-full h-full rounded-full border border-black/5" 
                            style={{ backgroundColor: v.colorHex }} 
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Specifications */}
                  <div className="grid grid-cols-1 gap-y-6 pt-8 border-t border-gray-100 dark:border-white/5">
                    <div className="flex items-center justify-between group">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic group-hover:text-black dark:group-hover:text-white transition-colors">Material</span>
                      <span className="text-[11px] font-black uppercase tracking-widest">{selectedProduct.materialName || "Aero-Composite"}</span>
                    </div>

                    <div className="flex items-center justify-between group">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic group-hover:text-black dark:group-hover:text-white transition-colors">Disponibilidad</span>
                      <span className={cn("text-[11px] font-black uppercase tracking-widest", activeVariant.stock <= 3 ? 'text-orange-500' : '')}>
                        {activeVariant.stock > 0 ? `Stock: ${activeVariant.stock} uds.` : "Agotado"}
                      </span>
                    </div>
                  </div>

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

                <div className="pt-12">
                  <Button 
                    className="w-full h-16 bg-black dark:bg-white text-white dark:text-black hover:opacity-80 transition-all rounded-none font-black text-xs uppercase tracking-[0.4em] border-none shadow-2xl flex items-center justify-center gap-4 group"
                    onClick={() => handleWhatsApp(activeVariant, selectedProduct.name)}
                    disabled={activeVariant.stock === 0}
                  >
                    <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    {activeVariant.stock > 0 ? "Consultar Stock" : "Agotado"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
