import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { Plus, Trash2 } from "lucide-react";
import Link from "next/link";

export default async function PhoneModelsPage() {
  const activeModels = await prisma.phoneModel.findMany({
    where: { status: 'active' },
    orderBy: { name: 'asc' }
  });

  const deletedCount = await prisma.phoneModel.count({
    where: { status: 'deleted' }
  });

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Modelos de Teléfono</h1>
          <p className="text-muted-foreground">
            Gestiona los modelos de teléfono disponibles
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/inventory/phone-models/deleted" className="flex items-center">
              <Trash2 className="mr-2 h-4 w-4" />
              Ver Eliminados ({deletedCount})
            </Link>
          </Button>
          <Button asChild>
            <Link href="/inventory/phone-models/new" className="flex items-center">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Modelo
            </Link>
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg border divide-y">
        {activeModels.length > 0 ? (
          activeModels.map((model) => (
            <div key={model.id} className="p-4 flex items-center justify-between">
              <div>
                <h3 className="font-medium">{model.name}</h3>
                <p className="text-sm text-muted-foreground">ID: {model.id}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/inventory/phone-models/${model.id}/edit`}>
                    Editar
                  </Link>
                </Button>
                <form action={`/api/phone-models/${model.id}`} method="DELETE">
                  <Button type="submit" variant="destructive" size="sm">
                    Eliminar
                  </Button>
                </form>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            No hay modelos de teléfono registrados
          </div>
        )}
      </div>
    </div>
  );
}
