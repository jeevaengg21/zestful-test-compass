
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
  ChevronRight,
  Database
} from "lucide-react";
import { TestCaseExecution } from "@/store/slices/testRunSlice";
import { useAppSelector } from "@/store/hooks";
import { selectTestDataSetsForTestCase, selectAllTestCaseDataMappings, selectAllTestDataSets } from "@/store/selectors";

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
  // Get test data for the selected test case
  const testDataSets = useAppSelector(state => 
    selectedTestCase ? selectTestDataSetsForTestCase(state, selectedTestCase.id) : []
  );

  // Debug logging
  const allMappings = useAppSelector(selectAllTestCaseDataMappings);
  const allTestDataSets = useAppSelector(selectAllTestDataSets);
  
  console.log('TestExecutionDrawer Debug:');
  console.log('Selected Test Case:', selectedTestCase);
  console.log('All Test Data Sets:', allTestDataSets);
  console.log('All Mappings:', allMappings);
  console.log('Test Data Sets for this test case:', testDataSets);
  if (selectedTestCase) {
    console.log('Mappings for test case ID:', selectedTestCase.id);
    const relevantMappings = allMappings.filter(m => m.testCaseId === selectedTestCase.id);
    console.log('Relevant mappings:', relevantMappings);
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical": return "bg-red-100 text-red-800 border-red-200";
      case "High": return "bg-orange-100 text-orange-800 border-orange-200";
      case "Medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="h-[85vh] bg-white">
        <DrawerHeader className="border-b bg-gray-50/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-3">
                <DrawerTitle className="text-xl font-semibold text-gray-900">Execute Test Case</DrawerTitle>
                {countdownActive && (
                  <div className="flex items-center gap-2">
                    <div className="animate-pulse text-blue-600 font-medium text-sm">
                      Auto-navigating in {countdown}s
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onCancelAutoNavigation}
                      className="text-xs"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
              <DrawerDescription className="text-sm text-gray-600 font-medium">
                Test case {currentExecutionNumber} of {totalExecutions} ({completionPercentage}% complete)
              </DrawerDescription>
              {/* Progress bar */}
              <div className="mt-3 w-full max-w-md">
                <Progress value={completionPercentage} className="h-2" />
              </div>
              {/* Keyboard shortcuts hint */}
              <div className="text-xs text-gray-500 mt-2 font-medium">
                Use ← → arrows to navigate, Ctrl+1-4 for quick actions, Esc to cancel/close
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onNavigatePrevious}
                disabled={!canNavigatePrevious}
                className="font-medium"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onNavigateNext}
                disabled={!canNavigateNext}
                className="font-medium"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </DrawerHeader>
        
        {selectedTestCase && selectedExecution && (
          <div className="flex-1 overflow-y-auto bg-gray-50/30">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
              {/* Test Case Details */}
              <div className="space-y-6">
                <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{selectedTestCase.title}</h3>
                    <Badge className={`${getPriorityColor(selectedTestCase.priority)} border font-medium`}>
                      {selectedTestCase.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700 mb-6 leading-relaxed">{selectedTestCase.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-600" />
                      <span className="text-gray-900 font-medium">Assignee:</span>
                      <span className="text-gray-700">{selectedTestCase.assignee}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Timer className="h-4 w-4 text-gray-600" />
                      <span className="text-gray-900 font-medium">Est. Time:</span>
                      <span className="text-gray-700">{selectedTestCase.estimatedTime}m</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-600" />
                      <span className="text-gray-900 font-medium">Created:</span>
                      <span className="text-gray-700">{selectedTestCase.createdDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Play className="h-4 w-4 text-gray-600" />
                      <span className="text-gray-900 font-medium">Last Run:</span>
                      <span className="text-gray-700">{selectedTestCase.lastRun}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                  <h4 className="font-semibold text-gray-900 mb-4 text-base">Test Steps</h4>
                  <ol className="space-y-3">
                    {selectedTestCase.steps.map((step: string, index: number) => (
                      <li key={index} className="flex gap-3">
                        <span className="bg-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        <span className="text-sm text-gray-800 leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                  <h4 className="font-semibold text-gray-900 mb-4 text-base">Expected Result</h4>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <p className="text-sm text-green-800 leading-relaxed font-medium">
                      {selectedTestCase.expectedResult}
                    </p>
                  </div>
                </div>

                {/* Test Data Section */}
                {testDataSets.length > 0 && (
                  <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <Database className="h-5 w-5 text-blue-600" />
                      <h4 className="font-semibold text-gray-900 text-base">Test Data</h4>
                    </div>
                    <div className="space-y-4">
                      {testDataSets.map((dataSet) => (
                        <div key={dataSet.id} className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <div className="font-semibold text-sm text-blue-900 mb-3">{dataSet.name}</div>
                          <div className="space-y-2">
                            {dataSet.items.map((item) => (
                              <div key={item.id} className="flex justify-between text-sm bg-white p-2 rounded border border-blue-100">
                                <span className="font-medium text-gray-800">{item.key}:</span>
                                <span className="text-gray-700 ml-2 font-mono">
                                  {item.type === 'password' ? '••••••••' : item.value}
                                </span>
                              </div>
                            ))}
                          </div>
                          {dataSet.description && (
                            <div className="text-xs text-blue-700 mt-2 italic font-medium">
                              {dataSet.description}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Debug info when no test data */}
                {testDataSets.length === 0 && selectedTestCase && (
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Database className="h-4 w-4 text-yellow-600" />
                      <h4 className="font-semibold text-yellow-800">No Test Data Found</h4>
                    </div>
                    <div className="text-xs text-yellow-700 space-y-1 font-medium">
                      <p>Test Case ID: {selectedTestCase.id}</p>
                      <p>Available mappings: {allMappings.filter(m => m.testCaseId === selectedTestCase.id).length}</p>
                      <p>To add test data, use the Test Data Mapper in the test case details.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Execution Form */}
              <div className="space-y-6">
                <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                  <label className="text-sm font-semibold text-gray-900 block mb-3">Actual Result</label>
                  <Textarea
                    value={actualResult}
                    onChange={(e) => onActualResultChange(e.target.value)}
                    placeholder="Describe what actually happened during execution"
                    className="min-h-[140px] text-sm leading-relaxed"
                  />
                </div>
                
                <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                  <label className="text-sm font-semibold text-gray-900 block mb-3">Notes</label>
                  <Textarea
                    value={executionNotes}
                    onChange={(e) => onExecutionNotesChange(e.target.value)}
                    placeholder="Any additional notes or observations"
                    className="min-h-[120px] text-sm leading-relaxed"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        
        <DrawerFooter className="border-t bg-gray-50/50 p-6">
          <div className="flex gap-3 justify-center">
            <Button
              onClick={() => selectedExecution && onExecutionUpdate(selectedExecution.id, "Passed")}
              className="bg-green-600 hover:bg-green-700 font-semibold shadow-sm"
              title="Ctrl+1"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Pass
            </Button>
            <Button
              onClick={() => selectedExecution && onExecutionUpdate(selectedExecution.id, "Failed")}
              className="bg-red-600 hover:bg-red-700 font-semibold shadow-sm"
              title="Ctrl+2"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Fail
            </Button>
            <Button
              onClick={() => selectedExecution && onExecutionUpdate(selectedExecution.id, "Blocked")}
              className="bg-yellow-600 hover:bg-yellow-700 font-semibold shadow-sm"
              title="Ctrl+3"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Block
            </Button>
            <Button
              onClick={() => selectedExecution && onExecutionUpdate(selectedExecution.id, "Skipped")}
              variant="outline"
              className="font-semibold"
              title="Ctrl+4"
            >
              <Clock className="h-4 w-4 mr-2" />
              Skip
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" className="font-semibold">Cancel</Button>
            </DrawerClose>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
