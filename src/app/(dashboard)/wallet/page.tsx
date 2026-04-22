import { redirect } from "next/navigation";
import { getSession } from "@/app/actions/auth";
import { prisma } from "@/lib/prisma";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import WalletClient from "./WalletClient";

export default async function WalletPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const transactions = await prisma.walletTransaction.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { name: true }
      }
    }
  });

  const suppliers = await prisma.supplier.findMany({
    where: { status: "active" },
    select: { id: true, name: true }
  });

  const balance = transactions.reduce((acc, t) => {
    return t.type === "ingreso" ? acc + t.amount : acc - t.amount;
  }, 0);

  const totalIngresos = transactions.filter(t => t.type === "ingreso").reduce((acc, t) => acc + t.amount, 0);
  const totalEgresos = transactions.filter(t => t.type === "egreso").reduce((acc, t) => acc + t.amount, 0);

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
                <BreadcrumbPage>Wallet de Compensaciones</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Wallet y Compensaciones</h1>
          <p className="text-muted-foreground">Gestiona los reembolsos, ajustes de precios y saldos a favor o en contra con proveedores.</p>
        </div>
        <WalletClient 
          transactions={transactions} 
          suppliers={suppliers}
          balance={balance}
          totalIngresos={totalIngresos}
          totalEgresos={totalEgresos}
        />
      </div>
    </>
  );
}
