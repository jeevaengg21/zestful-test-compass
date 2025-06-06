
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/sonner";
import { Settings } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { 
  selectTestRunById, 
  selectTestCaseExecutionsByRun, 
  selectAllTestCases, 
  selectAllTestSuites,
  selectTestCasesInSuite
} from "@/store/selectors";
import { updateTestCaseExecution, addDefect, TestCaseExecution } from "@/store/slices/testRunSlice";
import { TestCaseExecutionTable } from "./TestCaseExecutionTable";
import { TestExecutionDrawer } from "./TestExecutionDrawer";
import { DefectCreationDialog } from "./DefectCreationDialog";

interface TestRunExecutionProps {
  testRunId: string;
  onClose: () => void;
}

export function TestRunExecution({ testRunId, onClose }: TestRunExecutionProps) {
  const dispatch = useAppDispatch();
  const testRun = useAppSelector(state => selectTestRunById(state, testRunId));
  const executions = useAppSelector(state => selectTestCaseExecutionsByRun(state, testRunId));
  const allTestCases = useAppSelector(selectAllTestCases);
  const allTestSuites = useAppSelector(selectAllTestSuites);
  
  const [selectedExecutionIndex, setSelectedExecutionIndex] = useState<number | null>(null);
  const [executionNotes, setExecutionNotes] = useState("");
  const [actualResult, setActualResult] = useState("");
  const [isDefectDialogOpen, setIsDefectDialogOpen] = useState(false);
  const [autoNavigationEnabled, setAutoNavigationEnabled] = useState(true);
  const [countdownActive, setCountdownActive] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [defectData, setDefectData] = useState<{
    title: string;
    description: string;
    severity: "Critical" | "High" | "Medium" | "Low";
    reproductionSteps: string;
  }>({
    title: "",
    description: "",
    severity: "Medium",
    reproductionSteps: ""
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const tableRef = useRef<HTMLDivElement>(null);
  const countdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get all test cases from the test suites assigned to this test run
  const testSuiteTestCases = useAppSelector(state => {
    if (!testRun) return [];
    
    // Flatten all test cases from all test suites in this test run
    let allTestCasesFromSuites: any[] = [];
    testRun.testSuiteIds.forEach(suiteId => {
      const testCasesInSuite = selectTestCasesInSuite(state, suiteId);
      allTestCasesFromSuites = [...allTestCasesFromSuites, ...testCasesInSuite];
    });
    
    return allTestCasesFromSuites;
  });
  
  // Console logging for debugging
  useEffect(() => {
    if (testRun) {
      console.log('Test Run:', testRun);
      console.log('Test Suite IDs:', testRun.testSuiteIds);
      console.log('Test Cases from Test Suites:', testSuiteTestCases);
      console.log('Executions:', executions);
    }
  }, [testRun, testSuiteTestCases, executions]);

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
      const startIndex = (currentPage - 1) * itemsPerPage;
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

  // Improved function to get test case details by checking both direct ID lookup and suite mappings
  const getTestCaseDetails = (testCaseId: string) => {
    // First try direct lookup from all test cases
    const directMatch = allTestCases.find(tc => tc.id === testCaseId);
    if (directMatch) return directMatch;
    
    // If not found directly, check if it's in any of the test suites for this run
    const testCaseInSuites = testSuiteTestCases.find(tc => tc.id === testCaseId);
    return testCaseInSuites || null;
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

  const handleCreateDefect = () => {
    if (!selectedExecution) return;

    const testCase = getTestCaseDetails(selectedExecution.testCaseId);

    const defect = {
      title: defectData.title,
      description: defectData.description,
      severity: defectData.severity,
      priority: "P2" as const,
      status: "Open" as const,
      testRunId,
      testCaseExecutionId: selectedExecution.id,
      reportedBy: "USR001", // Should be current user
      reportedDate: new Date().toISOString().split('T')[0],
      reproductionSteps: defectData.reproductionSteps.split('\n').filter(step => step.trim()),
      expectedResult: testCase?.expectedResult || "",
      actualResult: actualResult
    };

    dispatch(addDefect(defect));
    
    // Also update the execution to failed status
    handleExecutionUpdate(selectedExecution.id, "Failed");
    
    setIsDefectDialogOpen(false);
    setDefectData({
      title: "",
      description: "",
      severity: "Medium",
      reproductionSteps: ""
    });
  };

  const handlePageChange = (page: number) => {
    const totalPages = Math.ceil(executions.length / itemsPerPage);
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const openExecutionDrawer = (index: number) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
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

  const handleDefectClick = (index: number) => {
    openExecutionDrawer(index);
    setIsDefectDialogOpen(true);
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
      <TestCaseExecutionTable
        executions={executions}
        selectedExecutionIndex={selectedExecutionIndex}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        getTestCaseDetails={getTestCaseDetails}
        onExecutionClick={openExecutionDrawer}
        onDefectClick={handleDefectClick}
        onPageChange={handlePageChange}
        tableRef={tableRef}
      />

      {/* Execution Drawer */}
      <TestExecutionDrawer
        isOpen={selectedExecutionIndex !== null}
        onClose={() => {
          cancelAutoNavigation();
          setSelectedExecutionIndex(null);
        }}
        selectedExecution={selectedExecution}
        selectedTestCase={selectedTestCase}
        executionNotes={executionNotes}
        actualResult={actualResult}
        countdownActive={countdownActive}
        countdown={countdown}
        currentExecutionNumber={getCurrentExecutionNumber()}
        totalExecutions={executions.length}
        completionPercentage={getCompletionPercentage()}
        canNavigatePrevious={selectedExecutionIndex !== null && selectedExecutionIndex > 0}
        canNavigateNext={selectedExecutionIndex !== null && selectedExecutionIndex < executions.length - 1}
        onExecutionNotesChange={setExecutionNotes}
        onActualResultChange={setActualResult}
        onExecutionUpdate={handleExecutionUpdate}
        onNavigatePrevious={navigateToPrevious}
        onNavigateNext={navigateToNext}
        onCancelAutoNavigation={cancelAutoNavigation}
      />

      {/* Defect Creation Dialog */}
      <DefectCreationDialog
        isOpen={isDefectDialogOpen}
        onClose={() => setIsDefectDialogOpen(false)}
        defectData={defectData}
        onDefectDataChange={setDefectData}
        onCreateDefect={handleCreateDefect}
      />
    </div>
  );
}
