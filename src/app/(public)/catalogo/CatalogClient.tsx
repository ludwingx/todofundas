"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Search, Filter, MessageCircle, Smartphone, PackageX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar de Filtros */}
      <aside className="w-full lg:w-64 shrink-0 space-y-6">
        <div>
          <h3 className="font-semibold mb-3 flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </h3>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Marca</label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={selectedBrand}
              onChange={(e) => {
                setSelectedBrand(e.target.value);
                setSelectedModel(""); // Reset model when brand changes
              }}
            >
              <option value="">Todas las Marcas</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Modelo</label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              disabled={!selectedBrand && filteredModels.length > 50}
            >
              <option value="">Todos los Modelos</option>
              {filteredModels.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo de Producto</label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="">Todos los Tipos</option>
              {types.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          
          {(search || selectedBrand || selectedModel || selectedType) && (
            <Button 
              variant="outline" 
              className="w-full mt-4 text-xs"
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
      </aside>

      {/* Grid de Productos */}
      <main className="flex-1">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando <span className="font-medium text-foreground">{filteredProducts.length}</span> productos
          </p>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-gray-200 dark:border-gray-800">
            <PackageX className="w-12 h-12 text-gray-300 dark:text-gray-700 mb-4" />
            <h3 className="text-xl font-black uppercase tracking-tight mb-2">Sin resultados</h3>
            <p className="text-gray-400 dark:text-gray-600 text-sm max-w-sm">
              Intenta cambiar los filtros o los términos de búsqueda.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden group flex flex-col transition-all hover:shadow-lg border border-gray-200 dark:border-gray-800 hover:border-black dark:hover:border-white rounded-none bg-white dark:bg-black">
                <div className="relative aspect-square bg-gray-50 dark:bg-gray-950 flex items-center justify-center overflow-hidden">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <Smartphone className="w-12 h-12 text-gray-300 dark:text-gray-700" />
                  )}
                  {product.colorHex && (
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/90 dark:bg-black/90 backdrop-blur-sm px-2 py-1 border border-gray-200 dark:border-gray-800">
                      <span 
                        className="w-2.5 h-2.5 rounded-full border border-gray-300" 
                        style={{ backgroundColor: product.colorHex }} 
                      />
                      <span className="text-[9px] font-black leading-none uppercase tracking-wider">{product.colorName}</span>
                    </div>
                  )}
                </div>
                <CardContent className="p-4 flex-1">
                  <div className="mb-1 flex items-center justify-between">
                    <p className="text-xs text-gray-400 dark:text-gray-600 font-black uppercase tracking-widest">{product.brandName}</p>
                    {product.stock <= 3 && (
                      <span className="text-[9px] font-black uppercase tracking-widest border border-black dark:border-white px-1.5 py-0.5">¡Últimas!</span>
                    )}
                  </div>
                  <h3 className="font-bold text-sm leading-tight mb-2 line-clamp-2">{product.name}</h3>
                  <div className="text-xl font-black">Bs. {product.price.toFixed(2)}</div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button 
                    className="w-full gap-2 bg-black dark:bg-white text-white dark:text-black hover:opacity-80 transition-all rounded-none font-black text-xs uppercase tracking-wider border-none shadow-none" 
                    onClick={() => handleWhatsApp(product)}
                  >
                    <MessageCircle className="w-4 h-4" />
                    Consultar
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
