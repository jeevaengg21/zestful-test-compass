import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/sonner";
import { Settings } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { apiRequest } from "@/lib/queryClient";
import { 
  selectTestRunById, 
  selectTestCaseExecutionsByRun, 
  selectAllTestCases, 
  selectAllTestSuites,
  selectTestCasesInSuite,
  selectAllTestPlans
} from "@/store/selectors";
import { 
  fetchTestCaseExecutions, 
  fetchTestCasesForSuite,
  generateTestCaseExecutionsAsync, 
  updateTestCaseExecution, 
  updateTestCaseExecutionAsync,
  addDefect, 
  TestCaseExecution 
} from "@/store/slices/testRunSlice";
import { addTestCase } from "@/store/slices/testSlice"; // Add this import
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
  const rawExecutions = useAppSelector(state => selectTestCaseExecutionsByRun(state, testRunId));
  const allTestCases = useAppSelector(selectAllTestCases);
  const allTestSuites = useAppSelector(selectAllTestSuites);
  const allTestPlans = useAppSelector(selectAllTestPlans);
  
  // Order executions based on test suite order in test plan
  const executions = (() => {
    if (!testRun) return rawExecutions;
    
    const testPlan = allTestPlans.find(plan => plan.id === testRun.testPlanId);
    if (!testPlan) return rawExecutions;
    
    // Create ordered executions based on test suite order in test plan
    const orderedExecutions: TestCaseExecution[] = [];
    
    // Process each test suite in the order defined in the test plan
    testPlan.testSuiteIds.forEach(suiteId => {
      if (testRun.testSuiteIds.includes(suiteId)) {
        const suite = allTestSuites.find(s => s.id === suiteId);
        if (suite) {
          // For each test case in the suite, find its execution
          suite.testCaseIds.forEach(testCaseId => {
            const execution = rawExecutions.find(exec => exec.testCaseId === testCaseId);
            if (execution) {
              orderedExecutions.push(execution);
            }
          });
        }
      }
    });
    
    return orderedExecutions;
  })();
  
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
      console.log('Raw Executions:', rawExecutions);
      console.log('Ordered Executions:', executions);
    }
  }, [testRun, testSuiteTestCases, rawExecutions, executions]);

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

  // Fetch test case executions and test case details when component mounts
  useEffect(() => {
    const loadExecutions = async () => {
      try {
        // Fetch existing executions
        const executions = await dispatch(fetchTestCaseExecutions(testRunId)).unwrap();
        console.log(`Fetched ${executions.length} test case executions for run ${testRunId}`);
        
        // If no executions found and we have test suites, try to generate them
        if (executions.length === 0 && testRun?.testSuiteIds?.length > 0) {
          console.log("No executions found, will attempt to generate them");
          
          // Get all test cases from the test suites in this test run
          let allTestCases: any[] = [];
          
          for (const suiteId of testRun.testSuiteIds) {
            try {
              // Fetch test cases for this suite
              console.log(`Fetching test cases for suite ${suiteId}`);
              const suiteCases = await dispatch(fetchTestCasesForSuite(suiteId)).unwrap();
              console.log(`Got ${suiteCases.length} test cases for suite ${suiteId}`);
              allTestCases = [...allTestCases, ...suiteCases];
            } catch (error) {
              console.error(`Error fetching test cases for suite ${suiteId}:`, error);
            }
          }
          
          console.log(`Collected ${allTestCases.length} test cases for execution`);
          
          // Create test case execution records if we have test cases
          if (allTestCases.length > 0) {
            try {
              console.log("Generating test case executions");
              await dispatch(generateTestCaseExecutionsAsync({
                testRunId,
                testCases: allTestCases
              })).unwrap();
              console.log("Test case executions generated, reloading...");
              
              // Reload executions after generation
              dispatch(fetchTestCaseExecutions(testRunId));
            } catch (error) {
              console.error("Error generating test case executions:", error);
            }
          } else {
            console.warn("No test cases found to generate executions for");
          }
        } else {
          // Executions exist but we need to make sure we have the test case details
          console.log("Fetching test case details for existing executions...");
          
          // Extract unique test case IDs from executions
          const testCaseIds = [...new Set(executions.map(exec => exec.testCaseId))];
          console.log(`Need to fetch details for ${testCaseIds.length} unique test cases`);
          
          // For each test case ID in the executions, try to fetch the test case details
          for (const testCaseId of testCaseIds) {
            try {
              // First check if we already have this test case loaded
              const existingTestCase = allTestCases.find(tc => tc.id === testCaseId);
              if (!existingTestCase) {
                console.log(`Fetching test case details for ID: ${testCaseId}`);
                // Fetch the test case directly using the API
                const testCaseDetails = await apiRequest(`/api/test-cases/${testCaseId}`);
                if (testCaseDetails) {
                  console.log(`Successfully fetched test case: ${testCaseDetails.title}`);
                  // Dispatch the proper action creator instead of a raw action
                  dispatch(addTestCase(testCaseDetails));
                }
              }
            } catch (error) {
              console.error(`Error fetching test case ${testCaseId}:`, error);
            }
          }
        }
      } catch (error) {
        console.error("Error loading test case executions:", error);
      }
    };
    
    loadExecutions();
  }, [dispatch, testRunId, testRun, allTestCases]);

  // Improved function to get test case details by checking both direct ID lookup and suite mappings
  const getTestCaseDetails = (testCaseId: string) => {
    console.log('Getting test case details for ID:', testCaseId);
    
    // First try direct lookup from all test cases
    const directMatch = allTestCases.find(tc => tc.id === testCaseId);
    if (directMatch) {
      console.log('Found direct match for test case:', directMatch);
      return directMatch;
    }
    
    // If not found directly, check if it's in any of the test suites for this run
    const testCaseInSuites = testSuiteTestCases.find(tc => tc.id === testCaseId);
    if (testCaseInSuites) {
      console.log('Found test case in suites:', testCaseInSuites);
      return testCaseInSuites;
    }
    
    console.warn('Test case not found for ID:', testCaseId);
    return null;
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
      // No need to send executedBy - server will get it from auth token
      executedDate: new Date().toISOString().split('T')[0],
      actualResult: actualResult || undefined,
      notes: executionNotes || undefined
    };
    
    // Use the async thunk for updating the execution in the database
    dispatch(updateTestCaseExecutionAsync({ id: executionId, updates }))
      .unwrap()
      .then(() => {
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
      })
      .catch(error => {
        console.error("Failed to update test case execution:", error);
        toast.error(`Failed to update test: ${error.message || 'Unknown error'}`);
      });
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
      // reportedBy will be set by the server from auth token when API is implemented
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

  const navigateToPrevious = async () => {
    if (selectedExecutionIndex !== null && selectedExecutionIndex > 0) {
      const newIndex = selectedExecutionIndex - 1;
      setSelectedExecutionIndex(newIndex);
      
      // Get the execution record for the new index
      const execution = executions[newIndex];
      
      // Fetch fresh test case details for this execution
      try {
        console.log(`Fetching fresh test case details for ID: ${execution.testCaseId}`);
        const testCaseDetails = await apiRequest(`/api/test-cases/${execution.testCaseId}`);
        if (testCaseDetails) {
          console.log(`Successfully fetched test case: ${testCaseDetails.title}`);
          // Use the proper action creator
          dispatch(addTestCase(testCaseDetails));
        }
      } catch (error) {
        console.error(`Error fetching test case ${execution.testCaseId}:`, error);
      }
      
      // Update form data for the new execution
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

  const navigateToNext = async () => {
    if (selectedExecutionIndex !== null && selectedExecutionIndex < executions.length - 1) {
      const newIndex = selectedExecutionIndex + 1;
      setSelectedExecutionIndex(newIndex);
      
      // Get the execution record for the new index
      const execution = executions[newIndex];
      
      // Fetch fresh test case details for this execution
      try {
        console.log(`Fetching fresh test case details for ID: ${execution.testCaseId}`);
        const testCaseDetails = await apiRequest(`/api/test-cases/${execution.testCaseId}`);
        if (testCaseDetails) {
          console.log(`Successfully fetched test case: ${testCaseDetails.title}`);
          // Use the proper action creator
          dispatch(addTestCase(testCaseDetails));
        }
      } catch (error) {
        console.error(`Error fetching test case ${execution.testCaseId}:`, error);
      }
      
      // Update form data for the new execution
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
