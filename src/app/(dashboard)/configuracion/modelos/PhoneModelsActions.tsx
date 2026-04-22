import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { CreateModelDialog } from "./CreateModelDialog";

interface PhoneModelsActionsProps {
  showDeleted: boolean;
  deletedCount: number;
  onToggleShowDeleted: () => void;
  onModelCreated: () => void;
}

export function PhoneModelsActions({ showDeleted, deletedCount, onToggleShowDeleted, onModelCreated }: PhoneModelsActionsProps) {
  return (
    <div className="flex gap-2 flex-shrink-0">
      <CreateModelDialog onSuccess={onModelCreated} />
      <Button
        variant={showDeleted ? "default" : "outline"}
        onClick={onToggleShowDeleted}
        className="shrink-0"
      >
        <Trash2 className="h-4 w-4 mr-2" />
        {showDeleted ? 'Ver Activos' : `Papelera (${deletedCount})`}
      </Button>
    </div>
  );
}
