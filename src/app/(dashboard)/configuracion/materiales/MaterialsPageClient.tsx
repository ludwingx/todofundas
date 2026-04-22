"use client";
import { useState, useCallback } from "react";
import MaterialsClient from "./MaterialsClient";
import { MaterialsActions } from "./MaterialsActions";

export default function MaterialsPageClient() {
  const [showDeleted, setShowDeleted] = useState(false);
  const [deletedCount, setDeletedCount] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);

  const handleMaterialCreated = useCallback(() => {
    setReloadKey((key) => key + 1);
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
        reloadKey={reloadKey}
      />
    </>
  );
}
