import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { CreateBrandDialog } from "./CreateBrandDialog";

interface BrandsActionsProps {
  showDeleted: boolean;
  deletedCount: number;
  onToggleShowDeleted: () => void;
  onBrandCreated: () => void;
}

export function BrandsActions({
  showDeleted,
  deletedCount,
  onToggleShowDeleted,
  onBrandCreated,
}: BrandsActionsProps) {
  return (
    <div className="flex gap-2 flex-shrink-0">
      <CreateBrandDialog onSuccess={onBrandCreated} />
      <Button
        variant={showDeleted ? "default" : "outline"}
        onClick={onToggleShowDeleted}
        className="shrink-0"
      >
        <Trash2 className="h-4 w-4 mr-2" />
        {showDeleted ? "Ver Activas" : `Papelera (${deletedCount})`}
      </Button>
    </div>
  );
}
