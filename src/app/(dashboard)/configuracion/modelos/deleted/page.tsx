import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { Trash2, Undo, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { getSession } from "@/app/actions/auth";
import { redirect } from "next/navigation";

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default async function DeletedPhoneModelsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const userData = {
    name: session.name as string,
    email: session.username as string,
    avatar: "/avatars/default.jpg",
  };

  const deletedModels = await prisma.phoneModel.findMany({
    where: { status: 'deleted' },
    orderBy: { name: 'asc' }
  });

  return (
    <>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">Market GS</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/inventory/phone-models">Modelos Teléfono</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Eliminados</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-6 pt-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Modelos de Teléfono Eliminados</h1>
              <p className="text-muted-foreground">
                Gestiona los modelos de teléfono que han sido eliminados
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/inventory/phone-models" className="flex items-center">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Volver a Modelos
              </Link>
            </Button>
          </div>

          <div className="bg-white dark:bg-zinc-950 rounded-lg border">
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
                      <Button type="submit" variant="ghost" size="sm" className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950">
                        <Undo className="h-4 w-4 mr-2" />
                        Restaurar
                      </Button>
                    </form>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-muted-foreground">
                No hay modelos de teléfono eliminados
              </div>
            )}
          </div>
        </div>
      </>
  );
}
