"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Search, Globe, GlobeLock, Save, Pencil, X } from "lucide-react";
import { toast } from "sonner";

interface Product {
  id: string;
  phoneModel: { name: string };
  type: { name: string };
  color: { name: string };
  isPublic: boolean;
  publicPrice: number | null;
  priceRetail: number;
  imageUrl: string | null;
  images: { id: string; url: string; isCover: boolean }[];
}

export default function CatalogManagementClient({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<number | null>(null);
  const [tempPublic, setTempPublic] = useState<boolean>(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  const filteredProducts = products.filter((p) => {
    const searchString = `${p.type.name} ${p.phoneModel.name} ${p.color.name}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  const startEditing = (product: Product) => {
    setEditingId(product.id);
    setTempPrice(product.publicPrice);
    setTempPublic(product.isPublic);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setTempPrice(null);
  };

  const saveChanges = async (id: string) => {
    setSavingId(id);
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          isPublic: tempPublic,
          publicPrice: tempPrice
        }),
      });

      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, isPublic: tempPublic, publicPrice: tempPrice } : p))
        );
        toast.success("Catálogo actualizado correctamente");
        setEditingId(null);
      } else {
        toast.error("Error al guardar cambios");
      }
    } catch (error) {
      toast.error("Error de red");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar productos..."
            className="pl-10 h-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
           <Badge variant="outline" className="flex gap-2 h-10 px-4">
              <Globe className="h-3 w-3 text-blue-500" />
              <span className="text-xs font-bold">{products.filter(p => p.isPublic).length} Públicos</span>
           </Badge>
           <Badge variant="outline" className="flex gap-2 h-10 px-4">
              <GlobeLock className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs font-bold">{products.filter(p => !p.isPublic).length} Privados</span>
           </Badge>
        </div>
      </div>

      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[80px] font-bold py-4">Portada</TableHead>
              <TableHead className="font-bold py-4">Producto</TableHead>
              <TableHead className="font-bold">Estado Web</TableHead>
              <TableHead className="font-bold">Precio Tienda</TableHead>
              <TableHead className="font-bold">Precio Público</TableHead>
              <TableHead className="text-right pr-6 font-bold">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => {
              const isEditing = editingId === product.id;
              
              return (
                <TableRow key={product.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell className="py-4">
                    <div className="relative h-12 w-12 rounded-lg border bg-muted overflow-hidden group/img cursor-pointer" 
                         onClick={() => {
                           if (product.images.length > 1) {
                             // Lógica simple: rotar portada
                             const currentIndex = product.images.findIndex(img => img.url === product.imageUrl);
                             const nextIndex = (currentIndex + 1) % product.images.length;
                             const nextImageId = product.images[nextIndex].id;
                             
                             setSavingId(product.id);
                             fetch(`/api/products/${product.id}/cover`, {
                               method: "POST",
                               headers: { "Content-Type": "application/json" },
                               body: JSON.stringify({ imageId: nextImageId }),
                             }).then(res => {
                               if (res.ok) {
                                 setProducts(prev => prev.map(p => p.id === product.id ? { ...p, imageUrl: product.images[nextIndex].url } : p));
                                 toast.success("Portada actualizada");
                               }
                             }).finally(() => setSavingId(null));
                           } else {
                             toast.info("Este producto solo tiene una imagen.");
                           }
                         }}>
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[8px] font-bold text-muted-foreground uppercase">N/A</div>
                      )}
                      {product.images.length > 1 && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">
                          <span className="text-[8px] text-white font-bold uppercase">Cambiar</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="font-bold text-slate-900">{product.type.name} {product.phoneModel.name}</div>
                    <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">{product.color.name}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={isEditing ? tempPublic : product.isPublic}
                        disabled={!isEditing || savingId === product.id}
                        onCheckedChange={setTempPublic}
                      />
                      {(isEditing ? tempPublic : product.isPublic) ? (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">Visible</Badge>
                      ) : (
                        <Badge variant="outline" className="opacity-50 text-slate-500">Oculto</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium text-slate-500">Bs. {product.priceRetail}</span>
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <div className="relative w-28">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground">Bs.</span>
                        <Input
                          type="number"
                          value={tempPrice ?? ""}
                          className="pl-8 h-8 text-right font-bold focus-visible:ring-blue-500"
                          onChange={(e) => setTempPrice(e.target.value === "" ? null : parseFloat(e.target.value))}
                        />
                      </div>
                    ) : (
                      <span className={cn("font-bold", product.publicPrice ? "text-blue-600" : "text-slate-300")}>
                        {product.publicPrice ? `Bs. ${product.publicPrice}` : "No definido"}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    {isEditing ? (
                      <div className="flex justify-end gap-2">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0 text-slate-400 hover:text-red-600" 
                          onClick={cancelEditing}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          className="h-8 bg-blue-600 hover:bg-blue-700 text-white gap-2"
                          onClick={() => saveChanges(product.id)}
                          disabled={savingId === product.id}
                        >
                          <Save className="h-4 w-4" />
                          <span>{savingId === product.id ? "..." : "Guardar"}</span>
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 group" 
                        onClick={() => startEditing(product)}
                      >
                        <Pencil className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {filteredProducts.length === 0 && (
          <div className="p-12 text-center text-muted-foreground text-sm">
            No se encontraron productos en el catálogo.
          </div>
        )}
      </div>
    </div>
  );
}
