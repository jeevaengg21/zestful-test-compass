
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface DefectData {
  title: string;
  description: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  reproductionSteps: string;
}

interface DefectCreationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  defectData: DefectData;
  onDefectDataChange: (data: DefectData) => void;
  onCreateDefect: () => void;
}

export function DefectCreationDialog({
  isOpen,
  onClose,
  defectData,
  onDefectDataChange,
  onCreateDefect
}: DefectCreationDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Log Defect</DialogTitle>
          <DialogDescription>
            Create a defect report for the failed test case
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Title *</label>
            <input
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
              value={defectData.title}
              onChange={(e) => onDefectDataChange({ ...defectData, title: e.target.value })}
              placeholder="Brief description of the defect"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Description *</label>
            <Textarea
              value={defectData.description}
              onChange={(e) => onDefectDataChange({ ...defectData, description: e.target.value })}
              placeholder="Detailed description of the defect"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Reproduction Steps</label>
            <Textarea
              value={defectData.reproductionSteps}
              onChange={(e) => onDefectDataChange({ ...defectData, reproductionSteps: e.target.value })}
              placeholder="Step-by-step instructions to reproduce the defect (one step per line)"
            />
          </div>
          <div className="flex gap-4">
            <Button
              onClick={onCreateDefect}
              disabled={!defectData.title || !defectData.description}
            >
              Create Defect
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
