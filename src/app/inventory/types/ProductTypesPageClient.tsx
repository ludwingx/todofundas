"use client";
import { useState, useCallback, useEffect } from "react";
import ProductTypesClient from "./ProductTypesClient";
import { ProductTypesActions } from "./ProductTypesActions";

export default function ProductTypesPageClient() {
  const [showDeleted, setShowDeleted] = useState(false);
  const [deletedCount, setDeletedCount] = useState(0);

  const handleTypeCreated = useCallback(() => {
    // El hijo recargará la lista y actualizará el contador automáticamente
  }, []);

  return (
    <>
      <div className="flex w-full justify-end">
        <ProductTypesActions
          showDeleted={showDeleted}
          deletedCount={deletedCount}
          onToggleShowDeleted={() => setShowDeleted((v) => !v)}
          onTypeCreated={handleTypeCreated}
        />
      </div>
      <ProductTypesClient
        showDeleted={showDeleted}
        onTypeCreated={handleTypeCreated}
        onDeletedCountChange={setDeletedCount}
      />
    </>
  );
}
