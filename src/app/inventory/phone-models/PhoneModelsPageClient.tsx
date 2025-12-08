"use client";

import PhoneModelsClient from "./PhoneModelsClient";
import { PhoneModelsActions } from "./PhoneModelsActions";
import { useState, useCallback, useEffect } from "react";

export default function PhoneModelsPageClient() {
  const [showDeleted, setShowDeleted] = useState(false);
  const [deletedCount, setDeletedCount] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);

  const fetchDeletedCount = useCallback(async () => {
    try {
      const res = await fetch("/api/phone-models/count?status=deleted");
      const data = await res.json();
      if (typeof data.count === 'number') {
        setDeletedCount(data.count);
      }
    } catch {}
  }, []);

  const handleModelCreated = useCallback(() => {
    setReloadKey((key) => key + 1);
    fetchDeletedCount();
  }, [fetchDeletedCount]);

  useEffect(() => {
    fetchDeletedCount();
  }, [showDeleted, fetchDeletedCount]);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex w-full justify-end">
        <PhoneModelsActions
          showDeleted={showDeleted}
          deletedCount={deletedCount}
          onToggleShowDeleted={() => setShowDeleted((v) => !v)}
          onModelCreated={handleModelCreated}
        />
      </div>
      <PhoneModelsClient showDeleted={showDeleted} onModelCreated={handleModelCreated} reloadKey={reloadKey} />
    </div>
  );
}
