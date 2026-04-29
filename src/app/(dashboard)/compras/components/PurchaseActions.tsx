"use client";

import { useState } from "react";
import { 
  Trash2, 
  MoreHorizontal, 
  Edit, 
  ClipboardCheck,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deletePurchaseAction } from "@/app/actions/purchases";
import { toast } from "sonner";
import Link from "next/link";

export default function PurchaseActions({ purchaseId, status }: { purchaseId: string, status: string }) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    const result = await deletePurchaseAction(purchaseId);
    if (result.success) {
      toast.success("Pedido eliminado correctamente");
    } else {
      toast.error(result.error || "Error al eliminar");
    }
    setIsLoading(false);
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          
          <Link href={`/compras/${purchaseId}`}>
            <DropdownMenuItem className="cursor-pointer">
              <MoreHorizontal className="mr-2 h-4 w-4" /> Ver Detalles
            </DropdownMenuItem>
          </Link>

          {status === "pendiente" && (
            <>
              <Link href={`/compras/${purchaseId}/recibir`}>
                <DropdownMenuItem className="cursor-pointer text-orange-600 focus:text-orange-600">
                  <ClipboardCheck className="mr-2 h-4 w-4" /> Recibir Pedido
                </DropdownMenuItem>
              </Link>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                className="text-red-600 focus:text-red-600 cursor-pointer"
                onSelect={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Eliminar Pedido
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              ¿Confirmas la eliminación?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el pedido #{purchaseId.slice(0, 8).toUpperCase()}. 
              No se puede deshacer. Solo es posible eliminar pedidos que no han sido recibidos aún.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              className="bg-red-600 hover:bg-red-700"
              disabled={isLoading}
            >
              {isLoading ? "Eliminando..." : "Eliminar Definitivamente"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
