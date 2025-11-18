"use client";

import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import PhoneModelsClient from "./PhoneModelsClient";
import { PhoneModelsActions } from "./PhoneModelsActions";
import { useState, useCallback, useEffect } from "react";

export default function PhoneModelsPageClient({ userData }: { userData: { name: string; email: string; avatar: string } }) {
  const [showDeleted, setShowDeleted] = useState(false);
  const [deletedCount, setDeletedCount] = useState(0);

  const handleModelCreated = useCallback(() => {
    fetchDeletedCount();
  }, []);

  const fetchDeletedCount = useCallback(async () => {
    try {
      const res = await fetch("/api/phone-models/count?status=deleted");
      const data = await res.json();
      if (typeof data.count === 'number') {
        setDeletedCount(data.count);
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchDeletedCount();
  }, [showDeleted, fetchDeletedCount]);

  return (
    <>
      <AppSidebar user={userData} />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex w-full justify-end">
          <PhoneModelsActions 
            showDeleted={showDeleted} 
            deletedCount={deletedCount} 
            onToggleShowDeleted={() => setShowDeleted((v) => !v)} 
            onModelCreated={handleModelCreated}
          />
        </div>
        <PhoneModelsClient showDeleted={showDeleted} onModelCreated={handleModelCreated} />
      </div>
    </>
  );
}
