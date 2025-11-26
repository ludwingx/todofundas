"use client";
import { useState, useCallback } from "react";
import MaterialsClient from "./MaterialsClient";
import { MaterialsActions } from "./MaterialsActions";

export default function MaterialsPageClient() {
  const [showDeleted, setShowDeleted] = useState(false);
  const [deletedCount, setDeletedCount] = useState(0);

  const handleMaterialCreated = useCallback(() => {
    // El hijo recargará la lista y actualizará el contador automáticamente
  }, []);

  return (
    <>
      <div className="flex w-full justify-end">
        <MaterialsActions
          showDeleted={showDeleted}
          deletedCount={deletedCount}
          onToggleShowDeleted={() => setShowDeleted((v) => !v)}
          onMaterialCreated={handleMaterialCreated}
        />
      </div>
      <MaterialsClient
        showDeleted={showDeleted}
        onMaterialCreated={handleMaterialCreated}
        onDeletedCountChange={setDeletedCount}
      />
    </>
  );
}
