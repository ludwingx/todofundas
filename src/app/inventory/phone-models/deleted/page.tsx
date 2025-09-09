import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { Trash2, Undo } from "lucide-react";
import Link from "next/link";

export default async function DeletedPhoneModelsPage() {
  const deletedModels = await prisma.phoneModel.findMany({
    where: { status: 'deleted' },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Modelos de Teléfono Eliminados</h1>
          <p className="text-muted-foreground">
            Gestiona los modelos de teléfono que han sido eliminados
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/inventory/phone-models">
            <Undo className="mr-2 h-4 w-4" />
            Volver a Modelos
          </Link>
        </Button>
      </div>

      <div className="bg-white rounded-lg border">
        {deletedModels.length > 0 ? (
          <div className="divide-y">
            {deletedModels.map((model) => (
              <div key={model.id} className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{model.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    ID: {model.id}
                  </p>
                </div>
                <form action={`/api/phone-models/${model.id}/restore`} method="POST">
                  <Button type="submit" variant="ghost" size="sm">
                    <Undo className="h-4 w-4 mr-2" />
                    Restaurar
                  </Button>
                </form>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            No hay modelos de teléfono eliminados
          </div>
        )}
      </div>
    </div>
  );
}
