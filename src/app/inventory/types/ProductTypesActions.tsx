import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { CreateTypeDialog } from "./CreateTypeDialog";

interface ProductTypesActionsProps {
  showDeleted: boolean;
  deletedCount: number;
  onToggleShowDeleted: () => void;
  onTypeCreated: () => void;
}

export function ProductTypesActions({ showDeleted, deletedCount, onToggleShowDeleted, onTypeCreated }: ProductTypesActionsProps) {
  return (
    <div className="flex gap-2 flex-shrink-0">
      <CreateTypeDialog onSuccess={onTypeCreated} />
      <Button
        variant={showDeleted ? "default" : "outline"}
        onClick={onToggleShowDeleted}
        className="shrink-0"
      >
        <Trash2 className="h-4 w-4 mr-2" />
        {showDeleted ? "Ver Activos" : `Papelera (${deletedCount})`}
      </Button>
    </div>
  );
}
