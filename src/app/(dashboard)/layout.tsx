import { redirect } from "next/navigation";
import { getSession } from "@/app/actions/auth";
import { prisma as db } from "@/lib/prisma";
import { AppSidebar } from "@/components/app-sidebar";
import { NotificationBell } from "@/components/notification-bell";
import { ThemeSwitch } from "@/components/theme-switch";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  // Fetch latest user data to ensure the sidebar reflects profile updates
  const user = await db.user.findUnique({
    where: { id: session.userId as string },
    select: { name: true, username: true, role: true }
  });

  if (!user) {
    redirect("/login");
  }

  const userData = {
    name: user.name,
    email: user.username,
    avatar: "/avatars/default.jpg",
    role: user.role,
  };

  return (
    <SidebarProvider>
      <AppSidebar user={userData} />
      <SidebarInset>
        <div className="fixed top-3 right-4 z-50 flex items-center gap-2">
          <ThemeSwitch />
          <NotificationBell />
        </div>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
