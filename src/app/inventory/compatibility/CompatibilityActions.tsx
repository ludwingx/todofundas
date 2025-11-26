import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { CreateCompatibilityDialog } from "./CreateCompatibilityDialog";

interface CompatibilityActionsProps {
  showDeleted: boolean;
  deletedCount: number;
  onToggleShowDeleted: () => void;
  onCompatibilityCreated: () => void;
}

export function CompatibilityActions({
  showDeleted,
  deletedCount,
  onToggleShowDeleted,
  onCompatibilityCreated,
}: CompatibilityActionsProps) {
  return (
    <div className="flex gap-2 flex-shrink-0">
      <CreateCompatibilityDialog onSuccess={onCompatibilityCreated} />
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
