"use client";
import { useState, useCallback } from "react";
import BrandsClient from "./BrandsClient";
import { BrandsActions } from "./BrandsActions";

export default function BrandsPageClient() {
  const [showDeleted, setShowDeleted] = useState(false);
  const [deletedCount, setDeletedCount] = useState(0);

  const handleBrandCreated = useCallback(() => {
    // El hijo recargará la lista y actualizará el contador automáticamente
  }, []);

  return (
    <>
      <div className="flex w-full justify-end">
        <BrandsActions
          showDeleted={showDeleted}
          deletedCount={deletedCount}
          onToggleShowDeleted={() => setShowDeleted((v) => !v)}
          onBrandCreated={handleBrandCreated}
        />
      </div>
      <BrandsClient
        showDeleted={showDeleted}
        onBrandCreated={handleBrandCreated}
        onDeletedCountChange={setDeletedCount}
      />
    </>
  );
}
