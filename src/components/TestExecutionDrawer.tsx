
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { 
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Play,
  User,
  Calendar,
  Timer,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { TestCaseExecution } from "@/store/slices/testRunSlice";

interface TestExecutionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedExecution: TestCaseExecution | null;
  selectedTestCase: any;
  executionNotes: string;
  actualResult: string;
  countdownActive: boolean;
  countdown: number;
  currentExecutionNumber: number;
  totalExecutions: number;
  completionPercentage: number;
  canNavigatePrevious: boolean;
  canNavigateNext: boolean;
  onExecutionNotesChange: (value: string) => void;
  onActualResultChange: (value: string) => void;
  onExecutionUpdate: (executionId: string, status: TestCaseExecution['status']) => void;
  onNavigatePrevious: () => void;
  onNavigateNext: () => void;
  onCancelAutoNavigation: () => void;
}

export function TestExecutionDrawer({
  isOpen,
  onClose,
  selectedExecution,
  selectedTestCase,
  executionNotes,
  actualResult,
  countdownActive,
  countdown,
  currentExecutionNumber,
  totalExecutions,
  completionPercentage,
  canNavigatePrevious,
  canNavigateNext,
  onExecutionNotesChange,
  onActualResultChange,
  onExecutionUpdate,
  onNavigatePrevious,
  onNavigateNext,
  onCancelAutoNavigation
}: TestExecutionDrawerProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical": return "bg-red-100 text-red-800";
      case "High": return "bg-orange-100 text-orange-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "Low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="h-[80vh]">
        <DrawerHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                <DrawerTitle>Execute Test Case</DrawerTitle>
                {countdownActive && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="animate-pulse text-blue-600">
                      Auto-navigating in {countdown}s
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onCancelAutoNavigation}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
              <DrawerDescription>
                Test case {currentExecutionNumber} of {totalExecutions} ({completionPercentage}% complete)
              </DrawerDescription>
              {/* Progress bar */}
              <div className="mt-2 w-full max-w-md">
                <Progress value={completionPercentage} className="h-2" />
              </div>
              {/* Keyboard shortcuts hint */}
              <div className="text-xs text-gray-500 mt-2">
                Use ← → arrows to navigate, Ctrl+1-4 for quick actions, Esc to cancel/close
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onNavigatePrevious}
                disabled={!canNavigatePrevious}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onNavigateNext}
                disabled={!canNavigateNext}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </DrawerHeader>
        
        {selectedTestCase && selectedExecution && (
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
              {/* Test Case Details */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{selectedTestCase.title}</h3>
                    <Badge className={getPriorityColor(selectedTestCase.priority)}>
                      {selectedTestCase.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{selectedTestCase.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span>Assignee: {selectedTestCase.assignee}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Timer className="h-4 w-4 text-gray-500" />
                      <span>Est. Time: {selectedTestCase.estimatedTime}m</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>Created: {selectedTestCase.createdDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Play className="h-4 w-4 text-gray-500" />
                      <span>Last Run: {selectedTestCase.lastRun}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Test Steps:</h4>
                  <ol className="space-y-2">
                    {selectedTestCase.steps.map((step: string, index: number) => (
                      <li key={index} className="flex gap-2">
                        <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        <span className="text-sm">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Expected Result:</h4>
                  <p className="text-sm bg-green-50 p-3 rounded-md border border-green-200">
                    {selectedTestCase.expectedResult}
                  </p>
                </div>
              </div>

              {/* Execution Form */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium block mb-2">Actual Result</label>
                  <Textarea
                    value={actualResult}
                    onChange={(e) => onActualResultChange(e.target.value)}
                    placeholder="Describe what actually happened during execution"
                    className="min-h-[120px]"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium block mb-2">Notes</label>
                  <Textarea
                    value={executionNotes}
                    onChange={(e) => onExecutionNotesChange(e.target.value)}
                    placeholder="Any additional notes or observations"
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        
        <DrawerFooter className="border-t">
          <div className="flex gap-2 justify-center">
            <Button
              onClick={() => selectedExecution && onExecutionUpdate(selectedExecution.id, "Passed")}
              className="bg-green-600 hover:bg-green-700"
              title="Ctrl+1"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Pass
            </Button>
            <Button
              onClick={() => selectedExecution && onExecutionUpdate(selectedExecution.id, "Failed")}
              className="bg-red-600 hover:bg-red-700"
              title="Ctrl+2"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Fail
            </Button>
            <Button
              onClick={() => selectedExecution && onExecutionUpdate(selectedExecution.id, "Blocked")}
              className="bg-yellow-600 hover:bg-yellow-700"
              title="Ctrl+3"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Block
            </Button>
            <Button
              onClick={() => selectedExecution && onExecutionUpdate(selectedExecution.id, "Skipped")}
              variant="outline"
              title="Ctrl+4"
            >
              <Clock className="h-4 w-4 mr-2" />
              Skip
            </Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
