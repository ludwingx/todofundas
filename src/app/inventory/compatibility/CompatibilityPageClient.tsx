"use client";
import { useState, useCallback } from "react";
import { CompatibilityActions } from "./CompatibilityActions";
import CompatibilityClient from "./CompatibilityClient";

export default function CompatibilityPageClient() {
  const [showDeleted, setShowDeleted] = useState(false);
  const [deletedCount, setDeletedCount] = useState(0);

  const handleCompatibilityCreated = useCallback(() => {
    // El hijo recargará la lista y actualizará el contador automáticamente
  }, []);

  return (
    <>
      <div className="flex w-full justify-end">
        <CompatibilityActions
          showDeleted={showDeleted}
          deletedCount={deletedCount}
          onToggleShowDeleted={() => setShowDeleted((v) => !v)}
          onCompatibilityCreated={handleCompatibilityCreated}
        />
      </div>
      <CompatibilityClient
        showDeleted={showDeleted}
        onCompatibilityCreated={handleCompatibilityCreated}
        onDeletedCountChange={setDeletedCount}
      />
    </>
  );
}
