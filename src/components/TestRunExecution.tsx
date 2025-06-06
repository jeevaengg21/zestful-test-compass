import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { toast } from "@/components/ui/sonner";
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Play,
  Bug,
  User,
  Calendar,
  Timer,
  ChevronLeft,
  ChevronRight,
  Settings
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectTestRunById, selectTestCaseExecutionsByRun, selectAllTestCases } from "@/store/selectors";
import { updateTestCaseExecution, addDefect, TestCaseExecution } from "@/store/slices/testRunSlice";

interface TestRunExecutionProps {
  testRunId: string;
  onClose: () => void;
}

export function TestRunExecution({ testRunId, onClose }: TestRunExecutionProps) {
  const dispatch = useAppDispatch();
  const testRun = useAppSelector(state => selectTestRunById(state, testRunId));
  const executions = useAppSelector(state => selectTestCaseExecutionsByRun(state, testRunId));
  const allTestCases = useAppSelector(selectAllTestCases);
  
  const [selectedExecutionIndex, setSelectedExecutionIndex] = useState<number | null>(null);
  const [executionNotes, setExecutionNotes] = useState("");
  const [actualResult, setActualResult] = useState("");
  const [isDefectDialogOpen, setIsDefectDialogOpen] = useState(false);
  const [autoNavigationEnabled, setAutoNavigationEnabled] = useState(true);
  const [countdownActive, setCountdownActive] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [defectData, setDefectData] = useState({
    title: "",
    description: "",
    severity: "Medium" as const,
    reproductionSteps: ""
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const tableRef = useRef<HTMLDivElement>(null);
  const countdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (selectedExecutionIndex === null) return;
      
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          navigateToPrevious();
          break;
        case 'ArrowRight':
          event.preventDefault();
          navigateToNext();
          break;
        case 'Escape':
          event.preventDefault();
          if (countdownActive) {
            cancelAutoNavigation();
          } else {
            setSelectedExecutionIndex(null);
          }
          break;
        case '1':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            selectedExecution && handleExecutionUpdate(selectedExecution.id, "Passed");
          }
          break;
        case '2':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            selectedExecution && handleExecutionUpdate(selectedExecution.id, "Failed");
          }
          break;
        case '3':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            selectedExecution && handleExecutionUpdate(selectedExecution.id, "Blocked");
          }
          break;
        case '4':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            selectedExecution && handleExecutionUpdate(selectedExecution.id, "Skipped");
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedExecutionIndex, countdownActive]);

  // Auto-scroll to current test case in table
  useEffect(() => {
    if (selectedExecutionIndex !== null && tableRef.current) {
      const currentRowIndex = selectedExecutionIndex - startIndex;
      if (currentRowIndex >= 0 && currentRowIndex < itemsPerPage) {
        const tableRows = tableRef.current.querySelectorAll('tbody tr');
        const currentRow = tableRows[currentRowIndex] as HTMLElement;
        if (currentRow) {
          currentRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  }, [selectedExecutionIndex, currentPage]);

  if (!testRun) {
    return <div>Test run not found</div>;
  }

  // Calculate pagination
  const totalItems = executions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedExecutions = executions.slice(startIndex, endIndex);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Passed": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "Failed": return <XCircle className="h-4 w-4 text-red-600" />;
      case "Blocked": return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "Skipped": return <Clock className="h-4 w-4 text-gray-600" />;
      default: return <Play className="h-4 w-4 text-blue-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Passed": return "bg-green-100 text-green-800";
      case "Failed": return "bg-red-100 text-red-800";
      case "Blocked": return "bg-yellow-100 text-yellow-800";
      case "Skipped": return "bg-gray-100 text-gray-800";
      default: return "bg-blue-100 text-blue-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical": return "bg-red-100 text-red-800";
      case "High": return "bg-orange-100 text-orange-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "Low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTestCaseDetails = (testCaseId: string) => {
    return allTestCases.find(tc => tc.id === testCaseId);
  };

  const selectedExecution = selectedExecutionIndex !== null ? executions[selectedExecutionIndex] : null;
  const selectedTestCase = selectedExecution ? getTestCaseDetails(selectedExecution.testCaseId) : null;

  const cancelAutoNavigation = () => {
    if (countdownTimeoutRef.current) {
      clearTimeout(countdownTimeoutRef.current);
      countdownTimeoutRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setCountdownActive(false);
    setCountdown(3);
  };

  const startAutoNavigation = () => {
    if (!autoNavigationEnabled) return;
    
    setCountdownActive(true);
    setCountdown(3);
    
    // Countdown interval
    countdownIntervalRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Auto-navigation timeout
    countdownTimeoutRef.current = setTimeout(() => {
      setCountdownActive(false);
      setCountdown(3);
      navigateToNext();
    }, 3000);
  };

  const handleExecutionUpdate = (executionId: string, status: TestCaseExecution['status']) => {
    const execution = executions.find(e => e.id === executionId);
    if (!execution) return;

    const updates = {
      status,
      executedBy: "USR001", // Should be current user
      executedDate: new Date().toISOString().split('T')[0],
      actualResult: actualResult || undefined,
      notes: executionNotes || undefined
    };
    
    dispatch(updateTestCaseExecution({ id: executionId, updates }));
    
    // Enhanced toast notification with progress info
    const currentNumber = selectedExecutionIndex !== null ? selectedExecutionIndex + 1 : 0;
    const progress = Math.round((currentNumber / executions.length) * 100);
    const remainingTests = executions.length - currentNumber;
    
    const statusMessages = {
      'Passed': `✅ Test ${currentNumber}/${executions.length} passed! (${progress}% complete)`,
      'Failed': `❌ Test ${currentNumber}/${executions.length} failed! (${progress}% complete)`,
      'Blocked': `⚠️ Test ${currentNumber}/${executions.length} blocked! (${progress}% complete)`,
      'Skipped': `⏭️ Test ${currentNumber}/${executions.length} skipped! (${progress}% complete)`
    };
    
    const nextTestInfo = remainingTests > 0 ? ` | ${remainingTests} tests remaining` : ' | All tests completed!';
    
    toast.success(statusMessages[status] + nextTestInfo, {
      duration: autoNavigationEnabled ? 3000 : 5000,
    });
    
    // Clear form data
    setExecutionNotes("");
    setActualResult("");
    
    // Start auto-navigation if enabled and there are more tests
    if (autoNavigationEnabled && remainingTests > 0) {
      startAutoNavigation();
    }
  };

  const handleCreateDefect = (executionId: string) => {
    const execution = executions.find(e => e.id === executionId);
    if (!execution) return;

    const defect = {
      title: defectData.title,
      description: defectData.description,
      severity: defectData.severity,
      priority: "P2" as const,
      status: "Open" as const,
      testRunId,
      testCaseExecutionId: executionId,
      reportedBy: "USR001", // Should be current user
      reportedDate: new Date().toISOString().split('T')[0],
      reproductionSteps: defectData.reproductionSteps.split('\n').filter(step => step.trim()),
      expectedResult: getTestCaseDetails(execution.testCaseId)?.expectedResult || "",
      actualResult: actualResult
    };

    dispatch(addDefect(defect));
    
    // Also update the execution to failed status
    handleExecutionUpdate(executionId, "Failed");
    
    setIsDefectDialogOpen(false);
    setDefectData({
      title: "",
      description: "",
      severity: "Medium",
      reproductionSteps: ""
    });
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const openExecutionDrawer = (index: number) => {
    const globalIndex = startIndex + index;
    setSelectedExecutionIndex(globalIndex);
    
    // Pre-fill form data if execution has existing data
    const execution = executions[globalIndex];
    setActualResult(execution.actualResult || "");
    setExecutionNotes(execution.notes || "");
    
    // Cancel any ongoing auto-navigation
    cancelAutoNavigation();
  };

  const navigateToPrevious = () => {
    if (selectedExecutionIndex !== null && selectedExecutionIndex > 0) {
      const newIndex = selectedExecutionIndex - 1;
      setSelectedExecutionIndex(newIndex);
      
      // Update form data for the new execution
      const execution = executions[newIndex];
      setActualResult(execution.actualResult || "");
      setExecutionNotes(execution.notes || "");
      
      // Update pagination if needed
      const newPage = Math.floor(newIndex / itemsPerPage) + 1;
      if (newPage !== currentPage) {
        setCurrentPage(newPage);
      }
      
      // Cancel auto-navigation when manually navigating
      cancelAutoNavigation();
    }
  };

  const navigateToNext = () => {
    if (selectedExecutionIndex !== null && selectedExecutionIndex < executions.length - 1) {
      const newIndex = selectedExecutionIndex + 1;
      setSelectedExecutionIndex(newIndex);
      
      // Update form data for the new execution
      const execution = executions[newIndex];
      setActualResult(execution.actualResult || "");
      setExecutionNotes(execution.notes || "");
      
      // Update pagination if needed
      const newPage = Math.floor(newIndex / itemsPerPage) + 1;
      if (newPage !== currentPage) {
        setCurrentPage(newPage);
      }
    }
  };

  const getCurrentExecutionNumber = () => {
    return selectedExecutionIndex !== null ? selectedExecutionIndex + 1 : 0;
  };

  const getCompletionPercentage = () => {
    const currentNumber = getCurrentExecutionNumber();
    return Math.round((currentNumber / executions.length) * 100);
  };

  const generatePageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">{testRun.name}</h2>
          <p className="text-gray-600 mt-1">{testRun.description}</p>
          <div className="flex gap-4 mt-2">
            <Badge className="bg-blue-100 text-blue-800">
              {testRun.executedTestCases}/{testRun.totalTestCases} Executed
            </Badge>
            <Badge className="bg-green-100 text-green-800">
              {testRun.passedTestCases} Passed
            </Badge>
            <Badge className="bg-red-100 text-red-800">
              {testRun.failedTestCases} Failed
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoNavigationEnabled(!autoNavigationEnabled)}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Auto-nav: {autoNavigationEnabled ? "ON" : "OFF"}
          </Button>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      {/* Test Case Executions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Test Case Executions</span>
            <div className="flex items-center gap-4">
              {selectedExecutionIndex !== null && (
                <div className="text-sm text-gray-500">
                  Currently executing: Test {getCurrentExecutionNumber()} of {executions.length}
                </div>
              )}
              <span className="text-sm font-normal text-gray-500">
                Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} test cases
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div ref={tableRef}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Test Case</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Executed By</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedExecutions.map((execution, index) => {
                  const globalIndex = startIndex + index;
                  const isCurrentExecution = selectedExecutionIndex === globalIndex;
                  const testCase = getTestCaseDetails(execution.testCaseId);
                  
                  return (
                    <TableRow 
                      key={execution.id}
                      className={isCurrentExecution ? "bg-blue-50 border-blue-200 border-2" : ""}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {isCurrentExecution && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                          )}
                          <div>
                            <div className="font-medium">{testCase?.title || "Unknown Test Case"}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {testCase?.description}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(execution.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(execution.status)}
                            {execution.status}
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{testCase?.priority}</Badge>
                      </TableCell>
                      <TableCell>
                        {execution.executedBy ? "User" : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={isCurrentExecution ? "default" : "outline"}
                            onClick={() => openExecutionDrawer(index)}
                          >
                            {isCurrentExecution ? "Continue" : "Execute"}
                          </Button>
                          {execution.status === "Failed" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                openExecutionDrawer(index);
                                setIsDefectDialogOpen(true);
                              }}
                            >
                              <Bug className="h-4 w-4 mr-1" />
                              Log Defect
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => handlePageChange(currentPage - 1)}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {generatePageNumbers().map((page, index) => (
                    <PaginationItem key={index}>
                      {page === 'ellipsis' ? (
                        <PaginationEllipsis />
                      ) : (
                        <PaginationLink
                          onClick={() => handlePageChange(page as number)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => handlePageChange(currentPage + 1)}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Execution Drawer */}
      <Drawer open={selectedExecutionIndex !== null} onOpenChange={() => {
        cancelAutoNavigation();
        setSelectedExecutionIndex(null);
      }}>
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
                        onClick={cancelAutoNavigation}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
                <DrawerDescription>
                  Test case {getCurrentExecutionNumber()} of {executions.length} ({getCompletionPercentage()}% complete)
                </DrawerDescription>
                {/* Progress bar */}
                <div className="mt-2 w-full max-w-md">
                  <Progress value={getCompletionPercentage()} className="h-2" />
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
                  onClick={navigateToPrevious}
                  disabled={selectedExecutionIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={navigateToNext}
                  disabled={selectedExecutionIndex === executions.length - 1}
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
                      {selectedTestCase.steps.map((step, index) => (
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
                      onChange={(e) => setActualResult(e.target.value)}
                      placeholder="Describe what actually happened during execution"
                      className="min-h-[120px]"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium block mb-2">Notes</label>
                    <Textarea
                      value={executionNotes}
                      onChange={(e) => setExecutionNotes(e.target.value)}
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
                onClick={() => selectedExecution && handleExecutionUpdate(selectedExecution.id, "Passed")}
                className="bg-green-600 hover:bg-green-700"
                title="Ctrl+1"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Pass
              </Button>
              <Button
                onClick={() => selectedExecution && handleExecutionUpdate(selectedExecution.id, "Failed")}
                className="bg-red-600 hover:bg-red-700"
                title="Ctrl+2"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Fail
              </Button>
              <Button
                onClick={() => selectedExecution && handleExecutionUpdate(selectedExecution.id, "Blocked")}
                className="bg-yellow-600 hover:bg-yellow-700"
                title="Ctrl+3"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Block
              </Button>
              <Button
                onClick={() => selectedExecution && handleExecutionUpdate(selectedExecution.id, "Skipped")}
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

      {/* Defect Creation Dialog */}
      <Dialog open={isDefectDialogOpen} onOpenChange={setIsDefectDialogOpen}>
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
                onChange={(e) => setDefectData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Brief description of the defect"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description *</label>
              <Textarea
                value={defectData.description}
                onChange={(e) => setDefectData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Detailed description of the defect"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Reproduction Steps</label>
              <Textarea
                value={defectData.reproductionSteps}
                onChange={(e) => setDefectData(prev => ({ ...prev, reproductionSteps: e.target.value }))}
                placeholder="Step-by-step instructions to reproduce the defect (one step per line)"
              />
            </div>
            <div className="flex gap-4">
              <Button
                onClick={() => selectedExecution && handleCreateDefect(selectedExecution.id)}
                disabled={!defectData.title || !defectData.description}
              >
                Create Defect
              </Button>
              <Button variant="outline" onClick={() => setIsDefectDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
