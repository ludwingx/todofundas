import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { CreateMaterialDialog } from "./CreateMaterialDialog";

interface MaterialsActionsProps {
  showDeleted: boolean;
  deletedCount: number;
  onToggleShowDeleted: () => void;
  onMaterialCreated: () => void;
}

export function MaterialsActions({
  showDeleted,
  deletedCount,
  onToggleShowDeleted,
  onMaterialCreated,
}: MaterialsActionsProps) {
  return (
    <div className="flex gap-2 flex-shrink-0">
      <CreateMaterialDialog onSuccess={onMaterialCreated} />
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
